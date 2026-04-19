import Link from 'next/link'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

type PaymentRow = {
  id: string
  order_id: string | null
  amount: number | string | null
  status: string | null
  method: string | null
  currency: string | null
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  created_at: string | null
}

type OrderRow = {
  id: string
  buyer_id: string | null
  vendor_id: string | null
  status: string | null
  total_amount: number | string | null
  created_at: string | null
}

type VendorRow = {
  id: string
  company_name: string | null
  slug: string | null
}

type OrderItemRow = {
  order_id: string | null
  product_id: string | null
  quantity: number | null
  price: number | string | null
}

type ProductRow = {
  id: string
  name: string | null
  slug: string | null
}

function getPaymentBadge(status: string | null) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-700'
    case 'failed':
      return 'bg-red-100 text-red-700'
    case 'refunded':
      return 'bg-slate-200 text-slate-700'
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-700'
  }
}

function safeMessage(message: string) {
  return encodeURIComponent(message)
}

function safeInternalPath(value?: string | null, fallback = '/payments') {
  const input = String(value || '').trim()
  if (!input) return fallback
  if (!input.startsWith('/')) return fallback
  if (input.startsWith('//')) return fallback
  return input
}

function buildLoginRedirectPath(orderId?: string, returnTo?: string) {
  const params = new URLSearchParams()

  if (orderId) params.set('order_id', orderId)
  if (returnTo) params.set('return_to', returnTo)

  const paymentPath = `/payments${params.toString() ? `?${params.toString()}` : ''}`
  return `/login?redirect_to=${encodeURIComponent(paymentPath)}&message=${encodeURIComponent(
    'Please log in to continue'
  )}`
}

function formatCurrency(amount: number | string | null | undefined) {
  return `$${Number(amount ?? 0).toFixed(2)}`
}

export default async function PublicPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    message?: string
    order_id?: string
    return_to?: string
  }>
}) {
  const { message, order_id: orderIdParam, return_to: returnToParam } =
    await searchParams

  const returnTo = safeInternalPath(returnToParam, '/products')
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(buildLoginRedirectPath(orderIdParam, returnTo))
  }

  /**
   * Alibaba-style behavior:
   * if user arrives here from "Place Order" with a specific order_id,
   * immediately create or reopen Stripe checkout and redirect there.
   */
  if (orderIdParam) {
    const { data: targetOrder } = await supabase
      .from('orders')
      .select('id, buyer_id, vendor_id, status, total_amount, created_at')
      .eq('id', orderIdParam)
      .eq('buyer_id', user.id)
      .maybeSingle<OrderRow>()

    if (!targetOrder) {
      redirect(`/payments?message=${safeMessage('Order not found')}`)
    }

    const { data: targetPayment } = await supabase
      .from('payments')
      .select(
        'id, order_id, amount, status, method, currency, stripe_checkout_session_id, stripe_payment_intent_id, created_at'
      )
      .eq('order_id', targetOrder.id)
      .maybeSingle<PaymentRow>()

    if (!targetPayment) {
      redirect(`/payments?message=${safeMessage('Payment record not found')}`)
    }

    if (targetPayment.status !== 'paid') {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-02-24.acacia',
      })

      if (targetPayment.stripe_checkout_session_id) {
        try {
          const existingSession = await stripe.checkout.sessions.retrieve(
            targetPayment.stripe_checkout_session_id
          )

          if (
            existingSession.status === 'open' &&
            existingSession.url
          ) {
            redirect(existingSession.url)
          }
        } catch {
          // Continue to create a fresh session below.
        }
      }

      const { data: orderItemsData } = await supabase
        .from('order_items')
        .select('order_id, product_id, quantity, price')
        .eq('order_id', targetOrder.id)

      const orderItems: OrderItemRow[] = orderItemsData || []

      if (orderItems.length === 0) {
        redirect(`/payments?message=${safeMessage('No order items found for checkout')}`)
      }

      const productIds = Array.from(
        new Set(
          orderItems
            .map((item) => item.product_id)
            .filter((id): id is string => Boolean(id))
        )
      )

      let productsMap = new Map<string, ProductRow>()

      if (productIds.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, slug')
          .in('id', productIds)

        productsMap = new Map(
          ((productsData || []) as ProductRow[]).map((product) => [product.id, product])
        )
      }

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
        'http://localhost:3001'

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        orderItems.map((item) => {
          const product = item.product_id
            ? productsMap.get(item.product_id)
            : null

          const unitAmount = Math.round(Number(item.price ?? 0) * 100)
          const quantity = Math.max(1, Number(item.quantity ?? 1))

          return {
            quantity,
            price_data: {
              currency: String(targetPayment.currency || 'usd').toLowerCase(),
              unit_amount: unitAmount,
              product_data: {
                name: product?.name || 'GTH Product',
              },
            },
          }
        })

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: user.email || undefined,
        line_items: lineItems,
        metadata: {
          order_id: targetOrder.id,
          payment_id: targetPayment.id,
          buyer_id: user.id,
        },
        success_url: `${siteUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/payments?order_id=${encodeURIComponent(
          targetOrder.id
        )}&return_to=${encodeURIComponent(returnTo)}&message=${encodeURIComponent(
          'Checkout cancelled. You can try again.'
        )}`,
      })

      await supabase
        .from('payments')
        .update({
          method: 'stripe',
          status: 'pending',
          currency: String(targetPayment.currency || 'usd').toLowerCase(),
          stripe_checkout_session_id: session.id,
        })
        .eq('id', targetPayment.id)

      if (session.url) {
        redirect(session.url)
      }

      redirect(`/payments?message=${safeMessage('Failed to start checkout session')}`)
    }
  }

  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('id, buyer_id, vendor_id, status, total_amount, created_at')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  if (ordersError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load payments: {ordersError.message}
        </div>
      </main>
    )
  }

  const orders: OrderRow[] = ordersData || []
  const orderIds = orders.map((o) => o.id)
  const vendorIds = Array.from(
    new Set(
      orders
        .map((o) => o.vendor_id)
        .filter((id): id is string => Boolean(id))
    )
  )

  let payments: PaymentRow[] = []
  let vendorsMap = new Map<string, VendorRow>()
  let orderItemsMap = new Map<string, OrderItemRow[]>()
  let productsMap = new Map<string, ProductRow>()

  if (vendorIds.length > 0) {
    const { data } = await supabase
      .from('vendors')
      .select('id, company_name, slug')
      .in('id', vendorIds)

    vendorsMap = new Map((data || []).map((row) => [row.id, row]))
  }

  if (orderIds.length > 0) {
    const { data: paymentsData } = await supabase
      .from('payments')
      .select(
        'id, order_id, amount, status, method, currency, stripe_checkout_session_id, stripe_payment_intent_id, created_at'
      )
      .in('order_id', orderIds)
      .order('created_at', { ascending: false })

    payments = paymentsData || []

    const { data: orderItemsData } = await supabase
      .from('order_items')
      .select('order_id, product_id, quantity, price')
      .in('order_id', orderIds)

    const items = orderItemsData || []
    for (const item of items) {
      const key = item.order_id || ''
      if (!key) continue
      const current = orderItemsMap.get(key) || []
      current.push(item)
      orderItemsMap.set(key, current)
    }

    const productIds = Array.from(
      new Set(
        items
          .map((i) => i.product_id)
          .filter((id): id is string => Boolean(id))
      )
    )

    if (productIds.length > 0) {
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, slug')
        .in('id', productIds)

      productsMap = new Map((productsData || []).map((row) => [row.id, row]))
    }
  }

  const orderMap = new Map(orders.map((order) => [order.id, order]))

  return (
    <main className="bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 p-8 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">
            GTH Payments
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Your Payments
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
            Track Stripe payment status, linked orders, and supplier transactions in one place.
          </p>
        </section>

        {message ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        <section className="mt-8 space-y-4">
          {payments.length > 0 ? (
            payments.map((payment) => {
              const order = payment.order_id ? orderMap.get(payment.order_id) : undefined
              const vendor = order?.vendor_id ? vendorsMap.get(order.vendor_id) : undefined
              const items = payment.order_id ? orderItemsMap.get(payment.order_id) || [] : []
              const firstItem = items[0]
              const firstProduct = firstItem?.product_id
                ? productsMap.get(firstItem.product_id)
                : undefined

              return (
                <div
                  key={payment.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-slate-900">
                          Payment #{payment.id.slice(0, 8)}
                        </p>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPaymentBadge(
                            payment.status
                          )}`}
                        >
                          {payment.status || 'pending'}
                        </span>
                      </div>

                      {firstProduct?.name ? (
                        <Link
                          href={`/products/${firstProduct.slug || firstProduct.id}`}
                          className="inline-block text-sm font-medium text-amber-600 hover:underline"
                        >
                          Product: {firstProduct.name}
                        </Link>
                      ) : (
                        <p className="text-sm text-slate-500">Product: N/A</p>
                      )}

                      <p className="text-sm text-slate-600">
                        Supplier:{' '}
                        {vendor?.slug ? (
                          <Link
                            href={`/vendors/${vendor.slug}`}
                            className="font-medium text-amber-600 hover:underline"
                          >
                            {vendor.company_name || 'N/A'}
                          </Link>
                        ) : (
                          <span className="font-medium text-slate-900">
                            {vendor?.company_name || 'N/A'}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 capitalize">
                        Method: {payment.method || 'stripe'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 uppercase">
                        {payment.currency || 'usd'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <p>
                        Order:{' '}
                        <span className="font-medium text-slate-900">
                          #{order?.id?.slice(0, 8) || 'N/A'}
                        </span>
                      </p>
                      <p>
                        Order status:{' '}
                        <span className="font-medium capitalize text-slate-900">
                          {order?.status || 'pending'}
                        </span>
                      </p>
                      <p>
                        Checkout session:{' '}
                        <span className="font-medium break-all text-slate-900">
                          {payment.stripe_checkout_session_id || 'N/A'}
                        </span>
                      </p>
                      <p>
                        Payment intent:{' '}
                        <span className="font-medium break-all text-slate-900">
                          {payment.stripe_payment_intent_id || 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {payment.status !== 'paid' && order?.id ? (
                      <Link
                        href={`/payments?order_id=${encodeURIComponent(
                          order.id
                        )}&return_to=${encodeURIComponent(returnTo)}`}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Continue Payment
                      </Link>
                    ) : null}

                    <Link
                      href="/orders"
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      View Orders
                    </Link>

                    <Link
                      href="/dashboard/messages"
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      Contact Supplier
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
              No payments found.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}