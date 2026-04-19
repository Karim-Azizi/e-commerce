import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type InquiryProduct =
  | {
      name: string | null
      slug: string | null
    }
  | {
      name: string | null
      slug: string | null
    }[]
  | null

type InquiryRow = {
  id: string
  buyer_id: string | null
  vendor_id: string | null
  message: string | null
  status: string | null
  created_at: string | null
  products: InquiryProduct
}

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
}

function getProductName(products: InquiryProduct) {
  if (!products) return 'N/A'
  if (Array.isArray(products)) return products[0]?.name || 'N/A'
  return products.name || 'N/A'
}

function getProductSlug(products: InquiryProduct) {
  if (!products) return null
  if (Array.isArray(products)) return products[0]?.slug || null
  return products.slug || null
}

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || 'buyer'

  let inquiries: InquiryRow[] = []

  if (role === 'vendor') {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!vendor) redirect('/dashboard/onboarding/vendor')

    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        id,
        buyer_id,
        vendor_id,
        message,
        status,
        created_at,
        products (
          name,
          slug
        )
      `)
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })

    if (error) {
      return (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load conversations: {error.message}
        </div>
      )
    }

    inquiries = (data || []) as InquiryRow[]
  } else {
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        id,
        buyer_id,
        vendor_id,
        message,
        status,
        created_at,
        products (
          name,
          slug
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load conversations: {error.message}
        </div>
      )
    }

    inquiries = (data || []) as InquiryRow[]
  }

  const userIds = Array.from(
    new Set(
      inquiries
        .flatMap((i) => [i.buyer_id, i.vendor_id])
        .filter((id): id is string => Boolean(id))
    )
  )

  let people = new Map<string, ProfileRow>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds)

    if (profiles) {
      people = new Map(
        profiles.map((p) => [p.id, p as ProfileRow])
      )
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
          Messages
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Conversations
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Review inquiry-based conversations between buyers and suppliers.
        </p>
      </section>

      <section className="space-y-4">
        {inquiries.length ? (
          inquiries.map((inquiry) => {
            const buyer = inquiry.buyer_id
              ? people.get(inquiry.buyer_id)
              : undefined

            const vendor = inquiry.vendor_id
              ? people.get(inquiry.vendor_id)
              : undefined

            const otherParty =
              role === 'vendor'
                ? buyer?.full_name || buyer?.email || 'Unknown Buyer'
                : vendor?.full_name || vendor?.email || 'Unknown Supplier'

            const productName = getProductName(inquiry.products)
            const productSlug = getProductSlug(inquiry.products)

            return (
              <div
                key={inquiry.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">
                      {otherParty}
                    </p>

                    <p className="text-sm text-slate-500">
                      Status: <span className="capitalize">{inquiry.status || 'new'}</span>
                    </p>

                    {productSlug ? (
                      <Link
                        href={`/products/${productSlug}`}
                        className="inline-block text-sm font-medium text-amber-600 hover:underline"
                      >
                        Product: {productName}
                      </Link>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Product: {productName}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-slate-500">
                    {inquiry.created_at
                      ? new Date(inquiry.created_at).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="line-clamp-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                    {inquiry.message || 'No message'}
                  </p>
                </div>

                <div className="mt-4">
                  <Link
                    href={`/dashboard/messages/${inquiry.id}`}
                    className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Open Conversation
                  </Link>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            No conversations found.
          </div>
        )}
      </section>
    </div>
  )
}