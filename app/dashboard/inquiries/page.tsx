import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Inquiry = {
  id: string
  product_id: string | null
  buyer_id: string | null
  vendor_id: string | null
  message: string | null
  status: string | null
  created_at: string | null
}

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
}

type ProductRow = {
  id: string
  name: string | null
  slug: string | null
}

function getStatusClasses(status: string | null) {
  switch (status) {
    case 'replied':
      return 'bg-blue-100 text-blue-700'
    case 'closed':
      return 'bg-slate-100 text-slate-700'
    case 'new':
    default:
      return 'bg-amber-100 text-amber-700'
  }
}

export default async function InquiriesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || 'buyer'

  let inquiries: Inquiry[] = []
  let vendorId: string | null = null

  if (role === 'vendor') {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!vendor) redirect('/dashboard/onboarding/vendor')

    vendorId = vendor.id

    const { data } = await supabase
      .from('inquiries')
      .select('id, product_id, buyer_id, vendor_id, message, status, created_at')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })

    inquiries = data || []
  } else {
    const { data } = await supabase
      .from('inquiries')
      .select('id, product_id, buyer_id, vendor_id, message, status, created_at')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })

    inquiries = data || []
  }

  const buyerIds = Array.from(
    new Set(
      inquiries.map((i) => i.buyer_id).filter((id): id is string => Boolean(id))
    )
  )

  const vendorIds = Array.from(
    new Set(
      inquiries.map((i) => i.vendor_id).filter((id): id is string => Boolean(id))
    )
  )

  const productIds = Array.from(
    new Set(
      inquiries
        .map((i) => i.product_id)
        .filter((id): id is string => Boolean(id))
    )
  )

  let buyerMap = new Map<string, ProfileRow>()
  let vendorNameMap = new Map<string, string>()
  let productMap = new Map<string, ProductRow>()

  if (buyerIds.length > 0) {
    const { data: buyers } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', buyerIds)

    if (buyers) {
      buyerMap = new Map(buyers.map((b) => [b.id, b as ProfileRow]))
    }
  }

  if (vendorIds.length > 0) {
    const { data: vendors } = await supabase
      .from('vendors')
      .select('id, company_name')
      .in('id', vendorIds)

    if (vendors) {
      vendorNameMap = new Map(
        vendors.map((v) => [v.id, v.company_name || 'Unknown Supplier'])
      )
    }
  }

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, slug')
      .in('id', productIds)

    if (products) {
      productMap = new Map(products.map((p) => [p.id, p as ProductRow]))
    }
  }

  const total = inquiries.length
  const newCount = inquiries.filter((i) => (i.status || 'new') === 'new').length
  const repliedCount = inquiries.filter((i) => i.status === 'replied').length
  const closedCount = inquiries.filter((i) => i.status === 'closed').length

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
          Leads & Buyers
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Inquiries
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {role === 'vendor'
            ? 'Review buyer questions and respond quickly to build trust and conversions.'
            : 'Track all product inquiries you have sent to suppliers.'}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Inquiries</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">New</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{newCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Replied</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{repliedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Closed</p>
          <p className="mt-2 text-3xl font-bold text-slate-700">{closedCount}</p>
        </div>
      </section>

      <section className="space-y-4">
        {inquiries.length ? (
          inquiries.map((inquiry) => {
            const buyer = inquiry.buyer_id
              ? buyerMap.get(inquiry.buyer_id)
              : undefined

            const product = inquiry.product_id
              ? productMap.get(inquiry.product_id)
              : undefined

            const supplierName = inquiry.vendor_id
              ? vendorNameMap.get(inquiry.vendor_id)
              : undefined

            return (
              <div
                key={inquiry.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {role === 'vendor'
                          ? buyer?.full_name || 'Unknown Buyer'
                          : supplierName || 'Unknown Supplier'}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                          inquiry.status
                        )}`}
                      >
                        {inquiry.status || 'new'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500">
                      {role === 'vendor'
                        ? buyer?.email || 'N/A'
                        : profile?.email || user.email || 'N/A'}
                    </p>

                    {product?.name ? (
                      <div className="pt-1">
                        <Link
                          href={
                            product.slug
                              ? `/products/${product.slug}`
                              : '/products'
                          }
                          className="text-sm font-medium text-amber-600 hover:underline"
                        >
                          Product: {product.name}
                        </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Product: N/A</p>
                    )}
                  </div>

                  <p className="text-sm text-slate-500">
                    {inquiry.created_at
                      ? new Date(inquiry.created_at).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                    {inquiry.message || 'No message'}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/messages"
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Open Messages
                  </Link>

                  <Link
                    href={`/dashboard/messages/${inquiry.id}`}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    View Conversation
                  </Link>

                  {role === 'vendor' && product?.slug ? (
                    <Link
                      href={`/products/${product.slug}`}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      View Product
                    </Link>
                  ) : null}
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            No inquiries found.
          </div>
        )}
      </section>
    </div>
  )
}