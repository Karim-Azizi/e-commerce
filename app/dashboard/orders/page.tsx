import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateOrderStatus } from '@/app/(public)/orders/actions'
import {
  ShoppingCart,
  Package,
  Store,
  User,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

type Role = 'buyer' | 'vendor' | 'admin'

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

type PaymentRow = {
  order_id: string | null
  amount: number | string | null
  status: string | null
  method: string | null
}

function getStatusClasses(status: string | null) {
  switch (status) {
    case 'confirmed':
      return 'bg-blue-100 text-blue-700'
    case 'processing':
      return 'bg-indigo-100 text-indigo-700'
    case 'shipped':
      return 'bg-purple-100 text-purple-700'
    case 'completed':
      return 'bg-emerald-100 text-emerald-700'
    case 'cancelled':
      return 'bg-red-100 text-red-700'
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-700'
  }
}

function getStatusIcon(status: string | null) {
  switch (status) {
    case 'completed':
      return CheckCircle2
    case 'cancelled':
      return XCircle
    case 'shipped':
      return Truck
    case 'processing':
    case 'confirmed':
    case 'pending':
    default:
      return Clock3
  }
}

function formatMoney(value: number | string | null) {
  return `$${Number(value ?? 0).toFixed(2)}`
}

function getRoleIntro(role: Role) {
  switch (role) {
    case 'vendor':
      return {
        title: 'Manage supplier orders',
        description:
          'Review buyer orders, update fulfillment status, and keep your supplier workflow organized.',
      }
    case 'admin':
      return {
        title: 'Monitor marketplace orders',
        description:
          'Oversee order activity, payment linkage, and status flow across the entire GTH marketplace.',
      }
    case 'buyer':
    default:
      return {
        title: 'Track your purchase orders',
        description:
          'Review your placed orders, monitor payment status, and manage supplier communication from one workspace.',
      }
  }
}

export default async function DashboardOrdersPage({
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
          .select('id, buyer_id, vendor_id, total_amount, status, created_at')
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false })
      : role === 'buyer'
      ? supabase
          .from('orders')
          .select('id, buyer_id, vendor_id, total_amount, status, created_at')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
      : supabase
          .from('orders')
          .select('id, buyer_id, vendor_id, total_amount, status, created_at')
          .order('created_at', { ascending: false })

  const { data: ordersData, error } = await ordersQuery

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load orders: {error.message}
      </div>
    )
  }

  const orders: OrderRow[] = ordersData || []

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
  const orderIds = orders.map((o) => o.id)

  let buyersMap = new Map<string, ProfileRow>()
  let vendorsMap = new Map<string, VendorRow>()
  let orderItemsMap = new Map<string, OrderItemRow[]>()
  let productsMap = new Map<string, ProductRow>()
  let paymentsMap = new Map<string, PaymentRow>()

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

  if (orderIds.length > 0) {
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

    const { data: paymentsData } = await supabase
      .from('payments')
      .select('order_id, amount, status, method')
      .in('order_id', orderIds)

    paymentsMap = new Map(
      ((paymentsData || []) as PaymentRow[])
        .filter((row) => row.order_id)
        .map((row) => [row.order_id as string, row])
    )
  }

  const totalOrders = orders.length
  const pendingOrders = orders.filter(
    (o) => (o.status || 'pending') === 'pending'
  ).length
  const completedOrders = orders.filter((o) => o.status === 'completed').length
  const revenue = orders.reduce(
    (sum, row) => sum + Number(row.total_amount ?? 0),
    0
  )

  const intro = getRoleIntro(role)
  const isSuccessMessage =
    !!message && /success|updated|saved|completed|confirmed|shipped/i.test(message)

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">
              GTH Orders
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
              href={role === 'buyer' ? '/dashboard/inquiries' : '/dashboard/payments'}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {role === 'buyer' ? 'Open Inquiries' : 'View Payments'}
            </Link>

            <Link
              href={role === 'buyer' ? '/dashboard/rfqs' : '/dashboard/products'}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              {role === 'buyer' ? 'Explore RFQs' : 'Open Products'}
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
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalOrders}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{pendingOrders}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{completedOrders}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            {role === 'buyer' ? 'Spend' : 'Order Value'}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatMoney(revenue)}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => {
            const StatusIcon = getStatusIcon(order.status)
            const buyer = order.buyer_id ? buyersMap.get(order.buyer_id) : undefined
            const vendor = order.vendor_id ? vendorsMap.get(order.vendor_id) : undefined
            const items = orderItemsMap.get(order.id) || []
            const payment = paymentsMap.get(order.id)
            const firstItem = items[0]
            const firstProduct = firstItem?.product_id
              ? productsMap.get(firstItem.product_id)
              : undefined

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <StatusIcon className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-slate-900">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                              order.status
                            )}`}
                          >
                            {order.status || 'pending'}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
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
                        <Package className="h-4 w-4 text-slate-400" />
                        Items:{' '}
                        <span className="font-medium text-slate-900">
                          {items.length}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {formatMoney(order.total_amount)}
                    </p>
                    <p className="mt-1 text-sm capitalize text-slate-500">
                      Payment: {payment?.status || 'pending'}
                    </p>
                    <p className="mt-1 text-sm capitalize text-slate-500">
                      Method: {payment?.method || 'manual'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <ShoppingCart className="h-4 w-4 text-amber-600" />
                      Order Items
                    </div>

                    <div className="mt-3 space-y-2">
                      {items.length > 0 ? (
                        items.map((item, index) => {
                          const product = item.product_id
                            ? productsMap.get(item.product_id)
                            : undefined

                          return (
                            <div
                              key={`${order.id}-${item.product_id}-${index}`}
                              className="flex flex-wrap items-center justify-between gap-3 text-sm"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900">
                                  {product?.name || 'Unknown Product'}
                                </p>
                                <p className="text-slate-500">
                                  Qty: {item.quantity ?? 0}
                                </p>
                              </div>
                              <p className="font-semibold text-slate-900">
                                {formatMoney(item.price)}
                              </p>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-sm text-slate-500">No order items found.</p>
                      )}
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        Payment:{' '}
                        <span className="font-medium capitalize text-slate-900">
                          {payment?.status || 'pending'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-slate-400" />
                        Method:{' '}
                        <span className="font-medium capitalize text-slate-900">
                          {payment?.method || 'manual'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {role === 'vendor' || role === 'admin' ? (
                    <div className="flex min-w-[240px] flex-col gap-3">
                      <form
                        action={updateOrderStatus}
                        className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <input type="hidden" name="order_id" value={order.id} />
                        <input
                          type="hidden"
                          name="return_to"
                          value="/dashboard/orders"
                        />

                        <label className="block text-sm font-medium text-slate-700">
                          Update Status
                        </label>

                        <select
                          name="status"
                          defaultValue={order.status || 'pending'}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                          type="submit"
                          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Save Update
                        </button>
                      </form>

                      <Link
                        href="/dashboard/payments"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                      >
                        View Payments
                      </Link>
                    </div>
                  ) : (
                    <div className="flex min-w-[240px] flex-col gap-3">
                      <Link
                        href="/dashboard/messages"
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Contact Supplier
                      </Link>

                      <Link
                        href="/dashboard/payments"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                      >
                        Payment Status
                      </Link>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center text-sm font-semibold text-amber-600">
                  Open details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            No orders found.
          </div>
        )}
      </section>
    </div>
  )
}