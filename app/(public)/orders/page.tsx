import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createPublicClient, getPublicStorageUrl } from '@/lib/supabase/server'
import {
  CalendarDays,
  PackageCheck,
  ShoppingBag,
  Store,
  Truck,
} from 'lucide-react'

type OrderRow = {
  id: string
  buyer_id: string | null
  vendor_id: string | null
  total_amount: number | string | null
  status: string | null
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
  product_images?: {
    image_url: string | null
    is_primary: boolean | null
  }[] | null
}

function getStatusClasses(status: string | null) {
  switch (status) {
    case 'confirmed':
      return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
    case 'processing':
      return 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
    case 'shipped':
      return 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
    case 'cancelled':
      return 'bg-red-100 text-red-700 ring-1 ring-red-200'
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
  }
}

function getProductImage(
  images:
    | {
        image_url: string | null
        is_primary: boolean | null
      }[]
    | null
    | undefined
) {
  if (!images || images.length === 0) return '/placeholder.png'
  const primary = images.find((img) => img?.is_primary && img?.image_url)
  return primary?.image_url || images[0]?.image_url || '/placeholder.png'
}

export default async function PublicOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams
  const supabase = await createPublicClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Please log in to view your orders')
  }

  const { data: ordersData, error } = await supabase
    .from('orders')
    .select('id, buyer_id, vendor_id, total_amount, status, created_at')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="bg-transparent">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            Failed to load orders: {error.message}
          </div>
        </div>
      </main>
    )
  }

  const orders: OrderRow[] = ordersData || []
  const vendorIds = Array.from(
    new Set(orders.map((o) => o.vendor_id).filter((id): id is string => Boolean(id)))
  )
  const orderIds = orders.map((o) => o.id)

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
    const { data: orderItemsData } = await supabase
      .from('order_items')
      .select('order_id, product_id, quantity, price')
      .in('order_id', orderIds)

    const items = orderItemsData || []
    orderItemsMap = new Map<string, OrderItemRow[]>()

    for (const item of items) {
      const key = item.order_id || ''
      if (!key) continue
      const current = orderItemsMap.get(key) || []
      current.push(item)
      orderItemsMap.set(key, current)
    }

    const productIds = Array.from(
      new Set(items.map((i) => i.product_id).filter((id): id is string => Boolean(id)))
    )

    if (productIds.length > 0) {
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          product_images (
            image_url,
            is_primary
          )
        `)
        .in('id', productIds)

      productsMap = new Map((productsData || []).map((row) => [row.id, row]))
    }
  }

  const totalOrders = orders.length
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length
  const completedOrders = orders.filter((o) => o.status === 'completed').length
  const totalSpend = orders.reduce(
    (sum, order) => sum + Number(order.total_amount ?? 0),
    0
  )

  return (
    <main className="bg-transparent text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-600 px-8 py-10 text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">
                  GTH Orders
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Your Orders
                </h1>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Track your purchases, supplier details, payment progress, and
                  product fulfillment from one premium buyer workspace.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                    Total Orders
                  </p>
                  <p className="mt-2 text-2xl font-bold">{totalOrders}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                    Confirmed
                  </p>
                  <p className="mt-2 text-2xl font-bold">{confirmedOrders}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                    Completed
                  </p>
                  <p className="mt-2 text-2xl font-bold">{completedOrders}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                    Total Spend
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    ${totalSpend.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {message ? (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            ) : null}

            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => {
                  const vendor = order.vendor_id
                    ? vendorsMap.get(order.vendor_id)
                    : undefined
                  const items = orderItemsMap.get(order.id) || []

                  return (
                    <article
                      key={order.id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
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

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                            <div className="inline-flex items-center gap-2">
                              <Store className="h-4 w-4 text-amber-600" />
                              <span>
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
                              </span>
                            </div>

                            <div className="inline-flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-slate-500" />
                              <span>
                                {order.created_at
                                  ? new Date(order.created_at).toLocaleDateString()
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Order Value
                          </p>
                          <p className="mt-1 text-2xl font-bold text-slate-900">
                            ${Number(order.total_amount ?? 0).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 py-6">
                        {items.length > 0 ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            {items.map((item, index) => {
                              const product = item.product_id
                                ? productsMap.get(item.product_id)
                                : undefined

                              return (
                                <div
                                  key={`${order.id}-${item.product_id}-${index}`}
                                  className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                >
                                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={getProductImage(product?.product_images)}
                                      alt={product?.name || 'Product'}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 font-semibold text-slate-900">
                                      {product?.slug ? (
                                        <Link
                                          href={`/products/${product.slug}`}
                                          className="transition hover:text-amber-600"
                                        >
                                          {product.name || 'Unknown Product'}
                                        </Link>
                                      ) : (
                                        product?.name || 'Unknown Product'
                                      )}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                                      <span className="inline-flex items-center gap-2">
                                        <PackageCheck className="h-4 w-4 text-slate-400" />
                                        Quantity: {item.quantity ?? 0}
                                      </span>
                                      <span className="inline-flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-slate-400" />
                                        Unit Price: $
                                        {Number(item.price ?? 0).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                            No order items found.
                          </div>
                        )}

                        <div className="mt-5 flex flex-wrap gap-3">
                          <Link
                            href="/payments"
                            className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            View Payments
                          </Link>
                          <Link
                            href="/products"
                            className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                          >
                            Continue Shopping
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200">
                  <ShoppingBag className="h-6 w-6 text-slate-500" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900">
                  No orders found
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Start sourcing products from trusted suppliers and your orders
                  will appear here.
                </p>
                <div className="mt-6">
                  <Link
                    href="/products"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}