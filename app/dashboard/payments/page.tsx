import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updatePaymentStatus } from '@/app/(public)/payments/actions'
import {
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
  Store,
  User,
  Receipt,
  ShieldCheck,
} from 'lucide-react'

type Role = 'buyer' | 'vendor' | 'admin'

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

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
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

function getPaymentIcon(status: string | null) {
  switch (status) {
    case 'paid':
      return CheckCircle2
    case 'failed':
      return XCircle
    case 'refunded':
      return RotateCcw
    case 'pending':
    default:
      return Clock3
  }
}

function getRoleIntro(role: Role) {
  switch (role) {
    case 'buyer':
      return {
        title: 'Track your payments',
        description:
          'Review payment progress, linked orders, and checkout status for your purchasing activity.',
      }
    case 'vendor':
      return {
        title: 'Manage payment flow',
        description:
          'Monitor incoming payment records, order-linked transactions, and supplier cashflow visibility.',
      }
    case 'admin':
    default:
      return {
        title: 'Monitor platform payments',
        description:
          'Oversee marketplace transaction activity, payment states, and order-linked Stripe records across GTH.',
      }
  }
}

function formatMoney(amount: number | string | null, currency?: string | null) {
  const value = Number(amount ?? 0)
  const code = (currency || 'USD').toUpperCase()

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

export default async function DashboardPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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
        role: 'buyer',
      })
      .select('id, role, full_name, email')
      .single()

    profile = insertedProfile
  }

  const role: Role =
    profile?.role === 'vendor' || profile?.role === 'admin'
      ? profile.role
      : 'buyer'

  let vendorId: string | null = null
  let vendorCompanyName: string | null = null

  if (role === 'vendor') {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, company_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!vendor) redirect('/dashboard/onboarding/vendor')

    vendorId = vendor.id
    vendorCompanyName = vendor.company_name || null
  }

  const ordersQuery =
    role === 'vendor' && vendorId
      ? supabase
          .from('orders')
          .select('id, buyer_id, vendor_id, status, total_amount, created_at')
          .eq('vendor_id', vendorId)
      : role === 'buyer'
      ? supabase
          .from('orders')
          .select('id, buyer_id, vendor_id, status, total_amount, created_at')
          .eq('buyer_id', user.id)
      : supabase
          .from('orders')
          .select('id, buyer_id, vendor_id, status, total_amount, created_at')

  const { data: ordersData, error: ordersError } = await ordersQuery.order(
    'created_at',
    { ascending: false }
  )

  if (ordersError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load payments: {ordersError.message}
      </div>
    )
  }

  const orders: OrderRow[] = ordersData || []
  const orderIds = orders.map((o) => o.id)

  let payments: PaymentRow[] = []
  let buyersMap = new Map<string, ProfileRow>()
  let vendorsMap = new Map<string, VendorRow>()
  let productsMap = new Map<string, ProductRow>()
  let orderItemsMap = new Map<string, OrderItemRow[]>()

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

    const items: OrderItemRow[] = orderItemsData || []

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

      productsMap = new Map(
        ((productsData || []) as ProductRow[]).map((row) => [row.id, row])
      )
    }
  }

  const buyerIds = Array.from(
    new Set(
      orders
        .map((o) => o.buyer_id)
        .filter((id): id is string => Boolean(id))
    )
  )
  const vendorIds = Array.from(
    new Set(
      orders
        .map((o) => o.vendor_id)
        .filter((id): id is string => Boolean(id))
    )
  )

  if (buyerIds.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', buyerIds)

    buyersMap = new Map(
      ((data || []) as ProfileRow[]).map((row) => [row.id, row])
    )
  }

  if (vendorIds.length > 0) {
    const { data } = await supabase
      .from('vendors')
      .select('id, company_name, slug')
      .in('id', vendorIds)

    vendorsMap = new Map(
      ((data || []) as VendorRow[]).map((row) => [row.id, row])
    )
  }

  const totalPayments = payments.length
  const pendingPayments = payments.filter(
    (p) => (p.status || 'pending') === 'pending'
  ).length
  const paidPayments = payments.filter((p) => p.status === 'paid').length
  const refundedPayments = payments.filter((p) => p.status === 'refunded').length
  const totalAmount = payments.reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0
  )

  const orderMap = new Map(orders.map((order) => [order.id, order]))
  const intro = getRoleIntro(role)
  const isSuccessMessage = !!message && /success|updated|saved|paid|refunded/i.test(message)

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">
              GTH Payments
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              {intro.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
              {role === 'vendor' && vendorCompanyName
                ? `${intro.description} Workspace linked to ${vendorCompanyName}.`
                : intro.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/dashboard/orders"
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              View Orders
            </Link>
            <Link
              href={role === 'buyer' ? '/payments' : '/dashboard/orders'}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              {role === 'buyer' ? 'Open Checkout History' : 'Review Linked Orders'}
            </Link>
          </div>
        </div>
      </section>

      {message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            isSuccessMessage
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Payments</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalPayments}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {pendingPayments}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Paid</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {paidPayments}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            {role === 'admin' ? 'Platform Value' : 'Total Value'}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatMoney(totalAmount, 'USD')}
          </p>
          {refundedPayments > 0 ? (
            <p className="mt-2 text-xs text-slate-500">
              Refunded records: {refundedPayments}
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        {payments.length > 0 ? (
          payments.map((payment) => {
            const PaymentIcon = getPaymentIcon(payment.status)
            const order = payment.order_id ? orderMap.get(payment.order_id) : undefined
            const buyer = order?.buyer_id ? buyersMap.get(order.buyer_id) : undefined
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
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <PaymentIcon className="h-5 w-5" />
                      </div>

                      <div>
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

                        <p className="mt-1 text-sm text-slate-500">
                          {payment.created_at
                            ? new Date(payment.created_at).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
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

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                      {role !== 'buyer' ? (
                        <p className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          Buyer:{' '}
                          <span className="font-medium text-slate-900">
                            {buyer?.full_name || buyer?.email || 'N/A'}
                          </span>
                        </p>
                      ) : null}

                      {role !== 'vendor' ? (
                        <p className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-slate-400" />
                          Supplier:{' '}
                          <span className="font-medium text-slate-900">
                            {vendor?.company_name || 'N/A'}
                          </span>
                        </p>
                      ) : null}

                      <p className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-slate-400" />
                        Order:{' '}
                        <span className="font-medium text-slate-900">
                          #{order?.id?.slice(0, 8) || 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {formatMoney(payment.amount, payment.currency)}
                    </p>
                    <p className="mt-1 text-sm capitalize text-slate-500">
                      Method: {payment.method || 'stripe'}
                    </p>
                    <p className="mt-1 text-sm uppercase text-slate-500">
                      {payment.currency || 'usd'}
                    </p>
                    <p className="mt-1 text-sm capitalize text-slate-500">
                      Order status: {order?.status || 'pending'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <ShieldCheck className="h-4 w-4 text-amber-600" />
                      Stripe Payment Summary
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p>
                        Payment status:{' '}
                        <span className="font-medium capitalize text-slate-900">
                          {payment.status || 'pending'}
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
                        <span className="break-all font-medium text-slate-900">
                          {payment.stripe_checkout_session_id || 'N/A'}
                        </span>
                      </p>
                      <p>
                        Payment intent:{' '}
                        <span className="break-all font-medium text-slate-900">
                          {payment.stripe_payment_intent_id || 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {role === 'vendor' || role === 'admin' ? (
                    <form
                      action={updatePaymentStatus}
                      className="min-w-[240px] space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <input type="hidden" name="payment_id" value={payment.id} />
                      <input
                        type="hidden"
                        name="return_to"
                        value="/dashboard/payments"
                      />

                      <label className="block text-sm font-medium text-slate-700">
                        Update Payment
                      </label>

                      <select
                        name="status"
                        defaultValue={payment.status || 'pending'}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Save Update
                      </button>
                    </form>
                  ) : (
                    <div className="flex min-w-[240px] flex-col gap-3">
                      <Link
                        href="/payments"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                      >
                        View Payment Detail
                      </Link>
                      <Link
                        href="/orders"
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        View Orders
                      </Link>
                    </div>
                  )}
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
  )
}