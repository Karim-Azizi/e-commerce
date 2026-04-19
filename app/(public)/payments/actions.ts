'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

type PaymentRow = {
  id: string
  order_id: string | null
  amount: number | string | null
  currency: string | null
  status: string | null
  method: string | null
  created_at: string | null
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
}

type OrderRow = {
  id: string
  buyer_id: string | null
  vendor_id: string | null
  total_amount: number | string | null
  status: string | null
  created_at: string | null
}

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
}

type VendorRow = {
  id: string
  company_name: string | null
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

function safeMessage(message: string) {
  return encodeURIComponent(message)
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatCurrency(amount: number | string | null | undefined, currency?: string | null) {
  const value = Number(amount ?? 0)
  const code = String(currency || 'USD').toUpperCase()

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
    }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

function formatDate(value?: string | null) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildInvoiceEmailHtml(params: {
  buyerName: string
  vendorName: string
  payment: PaymentRow
  order: OrderRow
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
  siteUrl: string
}) {
  const { buyerName, vendorName, payment, order, items, siteUrl } = params

  const rows = items.length
    ? items
        .map(
          (item) => `
            <tr>
              <td style="padding:12px 10px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-size:14px;">
                ${escapeHtml(item.name)}
              </td>
              <td style="padding:12px 10px;border-bottom:1px solid #e5e7eb;color:#475569;font-size:14px;text-align:center;">
                ${escapeHtml(item.quantity)}
              </td>
              <td style="padding:12px 10px;border-bottom:1px solid #e5e7eb;color:#475569;font-size:14px;text-align:right;">
                ${escapeHtml(formatCurrency(item.unitPrice, payment.currency))}
              </td>
              <td style="padding:12px 10px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">
                ${escapeHtml(formatCurrency(item.lineTotal, payment.currency))}
              </td>
            </tr>
          `
        )
        .join('')
    : `
      <tr>
        <td colspan="4" style="padding:12px 10px;border-bottom:1px solid #e5e7eb;color:#64748b;font-size:14px;text-align:center;">
          No order items found.
        </td>
      </tr>
    `

  return `
    <div style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;">
        <div style="padding:28px 32px;background:linear-gradient(90deg,#0f172a 0%,#1e293b 55%,#d97706 100%);color:#ffffff;">
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#fde68a;font-weight:700;">
            GTH Billing
          </div>
          <h1 style="margin:12px 0 0;font-size:30px;line-height:1.2;font-weight:800;">
            Payment Receipt & Invoice
          </h1>
          <p style="margin:12px 0 0;font-size:14px;line-height:1.8;color:#e2e8f0;">
            Thank you for your payment. Your transaction has been recorded successfully on Global Trade House.
          </p>
        </div>

        <div style="padding:28px 32px;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#334155;">
            Hello <strong>${escapeHtml(buyerName)}</strong>,
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#334155;">
            This email confirms that your payment for order
            <strong>#${escapeHtml(order.id.slice(0, 8))}</strong>
            has been received. Below is your invoice summary.
          </p>

          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:24px;">
            <div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#f8fafc;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">
                Buyer
              </div>
              <div style="margin-top:8px;font-size:15px;font-weight:700;color:#0f172a;">
                ${escapeHtml(buyerName)}
              </div>
            </div>

            <div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#f8fafc;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">
                Supplier
              </div>
              <div style="margin-top:8px;font-size:15px;font-weight:700;color:#0f172a;">
                ${escapeHtml(vendorName)}
              </div>
            </div>

            <div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#f8fafc;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">
                Order ID
              </div>
              <div style="margin-top:8px;font-size:15px;font-weight:700;color:#0f172a;">
                #${escapeHtml(order.id.slice(0, 8))}
              </div>
            </div>

            <div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#f8fafc;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">
                Payment ID
              </div>
              <div style="margin-top:8px;font-size:15px;font-weight:700;color:#0f172a;">
                #${escapeHtml(payment.id.slice(0, 8))}
              </div>
            </div>

            <div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#f8fafc;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">
                Payment Date
              </div>
              <div style="margin-top:8px;font-size:15px;font-weight:700;color:#0f172a;">
                ${escapeHtml(formatDate(payment.created_at))}
              </div>
            </div>

            <div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#f8fafc;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">
                Payment Method
              </div>
              <div style="margin-top:8px;font-size:15px;font-weight:700;color:#0f172a;text-transform:capitalize;">
                ${escapeHtml(payment.method || 'stripe')}
              </div>
            </div>
          </div>

          <div style="border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
            <div style="padding:14px 18px;background:#fff7ed;border-bottom:1px solid #fed7aa;font-size:13px;font-weight:700;color:#9a3412;letter-spacing:0.12em;text-transform:uppercase;">
              Order Items
            </div>

            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:12px 10px;text-align:left;font-size:12px;color:#475569;border-bottom:1px solid #e5e7eb;">Product</th>
                  <th style="padding:12px 10px;text-align:center;font-size:12px;color:#475569;border-bottom:1px solid #e5e7eb;">Qty</th>
                  <th style="padding:12px 10px;text-align:right;font-size:12px;color:#475569;border-bottom:1px solid #e5e7eb;">Unit Price</th>
                  <th style="padding:12px 10px;text-align:right;font-size:12px;color:#475569;border-bottom:1px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>

          <div style="margin-top:24px;border:1px solid #e2e8f0;border-radius:18px;padding:18px;background:#f8fafc;">
            <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap;">
              <div>
                <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">
                  Payment Status
                </div>
                <div style="margin-top:8px;font-size:16px;font-weight:800;color:#0f172a;text-transform:capitalize;">
                  ${escapeHtml(payment.status || 'paid')}
                </div>
              </div>

              <div style="text-align:right;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">
                  Total Paid
                </div>
                <div style="margin-top:8px;font-size:24px;font-weight:800;color:#0f172a;">
                  ${escapeHtml(formatCurrency(payment.amount, payment.currency))}
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top:24px;">
            <a href="${escapeHtml(siteUrl)}/dashboard/orders"
               style="display:inline-block;padding:13px 20px;border-radius:999px;background:#e85b00;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
              View Orders
            </a>
          </div>

          <p style="margin:24px 0 0;font-size:13px;line-height:1.8;color:#64748b;">
            If you have any billing questions, please reply to this email or contact the GTH support team.
          </p>
        </div>
      </div>
    </div>
  `
}

function buildInvoiceEmailText(params: {
  buyerName: string
  vendorName: string
  payment: PaymentRow
  order: OrderRow
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
}) {
  const { buyerName, vendorName, payment, order, items } = params

  const lines = items.length
    ? items
        .map(
          (item) =>
            `- ${item.name} | Qty: ${item.quantity} | Unit: ${formatCurrency(
              item.unitPrice,
              payment.currency
            )} | Total: ${formatCurrency(item.lineTotal, payment.currency)}`
        )
        .join('\n')
    : '- No order items found.'

  return `GTH Payment Receipt & Invoice

Hello ${buyerName},

Your payment has been received successfully.

Buyer: ${buyerName}
Supplier: ${vendorName}
Order ID: #${order.id.slice(0, 8)}
Payment ID: #${payment.id.slice(0, 8)}
Payment Date: ${formatDate(payment.created_at)}
Payment Method: ${payment.method || 'stripe'}
Payment Status: ${payment.status || 'paid'}
Total Paid: ${formatCurrency(payment.amount, payment.currency)}

Order Items:
${lines}

Thank you for using Global Trade House.
`
}

async function sendBillingEmail(params: {
  to: string
  buyerName: string
  vendorName: string
  payment: PaymentRow
  order: OrderRow
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
}) {
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail =
    process.env.BILLING_FROM_EMAIL ||
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
    'billing@gth.com'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

  if (!resendApiKey || !params.to) {
    return
  }

  const subject = `GTH Invoice for Order #${params.order.id.slice(0, 8)}`
  const html = buildInvoiceEmailHtml({
    buyerName: params.buyerName,
    vendorName: params.vendorName,
    payment: params.payment,
    order: params.order,
    items: params.items,
    siteUrl,
  })
  const text = buildInvoiceEmailText({
    buyerName: params.buyerName,
    vendorName: params.vendorName,
    payment: params.payment,
    order: params.order,
    items: params.items,
  })

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `GTH Billing <${fromEmail}>`,
      to: [params.to],
      subject,
      html,
      text,
    }),
    cache: 'no-store',
  })
}

export async function updatePaymentStatus(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const paymentId = String(formData.get('payment_id') || '').trim()
  const status = String(formData.get('status') || '').trim() as PaymentStatus
  const returnTo = String(
    formData.get('return_to') || '/dashboard/payments'
  ).trim()

  if (!paymentId || !status) {
    redirect(`${returnTo}?message=${safeMessage('Invalid payment update data')}`)
  }

  const allowedStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']
  if (!allowedStatuses.includes(status)) {
    redirect(`${returnTo}?message=${safeMessage('Invalid payment status')}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || 'buyer'

  const { data: paymentRow } = await supabase
    .from('payments')
    .select(
      'id, order_id, amount, currency, status, method, created_at, stripe_checkout_session_id, stripe_payment_intent_id'
    )
    .eq('id', paymentId)
    .maybeSingle<PaymentRow>()

  if (!paymentRow?.order_id) {
    redirect(`${returnTo}?message=${safeMessage('Payment not found')}`)
  }

  const { data: orderRow } = await supabase
    .from('orders')
    .select('id, buyer_id, vendor_id, total_amount, status, created_at')
    .eq('id', paymentRow.order_id)
    .maybeSingle<OrderRow>()

  if (!orderRow) {
    redirect(`${returnTo}?message=${safeMessage('Linked order not found')}`)
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

    if (orderRow.vendor_id !== vendor.id) {
      redirect(
        `${returnTo}?message=${safeMessage('You do not have access to this payment')}`
      )
    }
  } else if (role !== 'admin') {
    redirect(
      `${returnTo}?message=${safeMessage('Only suppliers or admins can update payments')}`
    )
  }

  const { error } = await supabase
    .from('payments')
    .update({ status })
    .eq('id', paymentId)

  if (error) {
    redirect(`${returnTo}?message=${safeMessage(error.message)}`)
  }

  if (status === 'paid') {
    const [{ data: buyer }, { data: vendor }, { data: orderItems }] =
      await Promise.all([
        orderRow.buyer_id
          ? supabase
              .from('profiles')
              .select('id, full_name, email')
              .eq('id', orderRow.buyer_id)
              .maybeSingle<ProfileRow>()
          : Promise.resolve({ data: null }),
        orderRow.vendor_id
          ? supabase
              .from('vendors')
              .select('id, company_name')
              .eq('id', orderRow.vendor_id)
              .maybeSingle<VendorRow>()
          : Promise.resolve({ data: null }),
        supabase
          .from('order_items')
          .select('order_id, product_id, quantity, price')
          .eq('order_id', orderRow.id),
      ])

    const itemRows = (orderItems || []) as OrderItemRow[]
    const productIds = Array.from(
      new Set(
        itemRows
          .map((item) => item.product_id)
          .filter((id): id is string => Boolean(id))
      )
    )

    let productsMap = new Map<string, ProductRow>()

    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, slug')
        .in('id', productIds)

      productsMap = new Map(
        ((products || []) as ProductRow[]).map((product) => [product.id, product])
      )
    }

    const invoiceItems = itemRows.map((item) => {
      const product = item.product_id ? productsMap.get(item.product_id) : null
      const quantity = Number(item.quantity ?? 0)
      const unitPrice = Number(item.price ?? 0)

      return {
        name: product?.name || 'Unknown Product',
        quantity,
        unitPrice,
        lineTotal: quantity * unitPrice,
      }
    })

    try {
      await sendBillingEmail({
        to: buyer?.email || '',
        buyerName: buyer?.full_name || buyer?.email || 'Buyer',
        vendorName: vendor?.company_name || 'Supplier',
        payment: {
          ...paymentRow,
          status,
        },
        order: orderRow,
        items: invoiceItems,
      })
    } catch {
      // do not block payment status update if email sending fails
    }
  }

  redirect(
    `${returnTo}?message=${safeMessage(
      status === 'paid'
        ? 'Payment updated successfully and invoice email sent'
        : 'Payment updated successfully'
    )}`
  )
}