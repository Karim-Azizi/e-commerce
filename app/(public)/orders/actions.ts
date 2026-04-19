'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function safeMessage(message: string) {
  return encodeURIComponent(message)
}

function safeInternalPath(
  value: FormDataEntryValue | null | undefined,
  fallback = '/products'
) {
  const input = String(value || '').trim()

  if (!input) return fallback
  if (!input.startsWith('/')) return fallback
  if (input.startsWith('//')) return fallback

  return input
}

function buildLoginRedirect(params: {
  message: string
  redirectTo: string
}) {
  const search = new URLSearchParams()
  search.set('message', params.message)
  search.set('redirect_to', params.redirectTo)
  return `/login?${search.toString()}`
}

export async function createOrder(formData: FormData) {
  const supabase = await createClient()

  const productId = String(formData.get('product_id') || '').trim()
  const quantity = Math.max(1, Number(formData.get('quantity') || 1))
  const returnTo = safeInternalPath(formData.get('return_to'), '/products')

  if (!productId) {
    redirect(`${returnTo}?message=${safeMessage('Product not found')}`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const paymentRedirect = `/payments?product_id=${encodeURIComponent(
    productId
  )}&quantity=${encodeURIComponent(String(quantity))}&return_to=${encodeURIComponent(
    returnTo
  )}`

  if (!user) {
    redirect(
      buildLoginRedirect({
        message: 'Please log in to place an order',
        redirectTo: paymentRedirect,
      })
    )
  }

  let { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    const { data: insertedProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email ?? null,
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0]?.replace(/[._-]/g, ' ') ||
          'User',
        role:
          user.user_metadata?.role === 'vendor' ||
          user.user_metadata?.role === 'supplier'
            ? 'vendor'
            : 'buyer',
      })
      .select('id, role, full_name, email')
      .single()

    profile = insertedProfile
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .select(
      'id, name, slug, vendor_id, price, stock, min_order, status'
    )
    .eq('id', productId)
    .eq('status', 'active')
    .maybeSingle()

  if (productError || !product) {
    redirect(`${returnTo}?message=${safeMessage('Product not found')}`)
  }

  const stock = Math.max(0, Number(product.stock ?? 0))
  const minOrder = Math.max(1, Number(product.min_order ?? 1))
  const unitPrice = Number(product.price ?? 0)

  if (quantity < minOrder) {
    redirect(
      `${returnTo}?message=${safeMessage(
        `Minimum order quantity is ${minOrder}`
      )}`
    )
  }

  if (stock > 0 && quantity > stock) {
    redirect(
      `${returnTo}?message=${safeMessage(
        'Requested quantity exceeds available stock'
      )}`
    )
  }

  if (!product.vendor_id) {
    redirect(`${returnTo}?message=${safeMessage('Supplier not found')}`)
  }

  /**
   * Alibaba-style behavior:
   * one account can act as buyer and supplier.
   * So vendor/supplier users are allowed to buy too.
   * Only block placing an order on their own product.
   */
  const { data: myVendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (myVendor?.id && myVendor.id === product.vendor_id) {
    redirect(
      `${returnTo}?message=${safeMessage(
        'You cannot place an order on your own product'
      )}`
    )
  }

  const totalAmount = unitPrice * quantity

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_id: user.id,
      vendor_id: product.vendor_id,
      total_amount: totalAmount,
      status: 'pending',
    })
    .select('id')
    .single()

  if (orderError || !order) {
    redirect(
      `${returnTo}?message=${safeMessage(
        orderError?.message || 'Failed to create order'
      )}`
    )
  }

  const { error: itemError } = await supabase.from('order_items').insert({
    order_id: order.id,
    product_id: product.id,
    quantity,
    price: unitPrice,
  })

  if (itemError) {
    await supabase.from('orders').delete().eq('id', order.id)

    redirect(
      `${returnTo}?message=${safeMessage(
        itemError.message || 'Failed to save order items'
      )}`
    )
  }

  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('order_id', order.id)
    .maybeSingle()

  if (!existingPayment) {
    const { error: paymentError } = await supabase.from('payments').insert({
      order_id: order.id,
      amount: totalAmount,
      status: 'pending',
      method: 'stripe',
      currency: 'usd',
    })

    if (paymentError) {
      await supabase.from('order_items').delete().eq('order_id', order.id)
      await supabase.from('orders').delete().eq('id', order.id)

      redirect(
        `${returnTo}?message=${safeMessage(
          paymentError.message || 'Failed to initialize payment'
        )}`
      )
    }
  }

  redirect(
    `/payments?order_id=${encodeURIComponent(
      order.id
    )}&product_id=${encodeURIComponent(
      product.id
    )}&quantity=${encodeURIComponent(
      String(quantity)
    )}&return_to=${encodeURIComponent(returnTo)}`
  )
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const orderId = String(formData.get('order_id') || '').trim()
  const status = String(formData.get('status') || '').trim()
  const returnTo = safeInternalPath(
    formData.get('return_to'),
    '/dashboard/orders'
  )

  if (!orderId || !status) {
    redirect(`${returnTo}?message=${safeMessage('Invalid order update data')}`)
  }

  const allowedStatuses = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'completed',
    'cancelled',
  ]

  if (!allowedStatuses.includes(status)) {
    redirect(`${returnTo}?message=${safeMessage('Invalid order status')}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || 'buyer'

  const { data: order } = await supabase
    .from('orders')
    .select('id, vendor_id')
    .eq('id', orderId)
    .maybeSingle()

  if (!order) {
    redirect(`${returnTo}?message=${safeMessage('Order not found')}`)
  }

  if (role === 'vendor') {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!vendor) {
      redirect('/dashboard/onboarding/vendor')
    }

    if (order.vendor_id !== vendor.id) {
      redirect(
        `${returnTo}?message=${safeMessage(
          'You do not have access to this order'
        )}`
      )
    }
  } else if (role !== 'admin') {
    redirect(
      `${returnTo}?message=${safeMessage(
        'Only suppliers or admins can update orders'
      )}`
    )
  }

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) {
    redirect(`${returnTo}?message=${safeMessage(error.message)}`)
  }

  redirect(`${returnTo}?message=${safeMessage('Order updated successfully')}`)
}