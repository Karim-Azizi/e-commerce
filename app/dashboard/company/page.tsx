import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type VendorRow = {
  id: string
  company_name: string
  slug: string | null
  country: string | null
  city: string | null
  address: string | null
  description: string | null
  verified: boolean | null
  rating: number | null
  created_at: string | null
}

export default async function CompanyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: vendor, error } = await supabase
    .from('vendors')
    .select(
      'id, company_name, slug, country, city, address, description, verified, rating, created_at'
    )
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load supplier profile: {error.message}
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            Supplier Profile
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Company Profile
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Create your supplier profile to start building your public company page.
          </p>
          <Link
            href="/dashboard/onboarding/vendor"
            className="mt-5 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Become a Supplier
          </Link>
        </section>
      </div>
    )
  }

  const [{ count: products }, { count: inquiries }, { count: orders }, { data: store }] =
    await Promise.all([
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendor.id),
      supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendor.id),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendor.id),
      supabase
        .from('store_settings')
        .select('logo, banner, theme')
        .eq('vendor_id', vendor.id)
        .maybeSingle(),
    ])

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-44 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-white text-2xl font-bold text-slate-900 shadow-sm">
                {store?.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.logo}
                    alt={vendor.company_name}
                    className="h-full w-full rounded-[20px] object-cover"
                  />
                ) : (
                  vendor.company_name.slice(0, 2).toUpperCase()
                )}
              </div>

              <div className="pb-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
                  GTH Supplier
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  {vendor.company_name}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {[vendor.city, vendor.country].filter(Boolean).join(', ') || 'Location not set'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {vendor.slug ? (
                <Link
                  href={`/vendors/${vendor.slug}`}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  View Public Profile
                </Link>
              ) : null}
              <Link
                href="/dashboard/storefront"
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Storefront Settings
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {vendor.verified ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
                Verified Supplier
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">
                Verification Pending
              </span>
            )}

            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Rating: {Number(vendor.rating ?? 0).toFixed(1)}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Theme: {store?.theme || 'Default'}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Products</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{products ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Inquiries</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{inquiries ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Orders</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{orders ?? 0}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Company Overview</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
            {vendor.description || 'No company description added yet.'}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Business Details</h2>
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-slate-700">
              <span className="font-semibold text-slate-900">Company Name:</span>{' '}
              {vendor.company_name}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-900">Slug:</span>{' '}
              {vendor.slug || 'Not set'}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-900">Country:</span>{' '}
              {vendor.country || 'Not set'}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-900">City:</span>{' '}
              {vendor.city || 'Not set'}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-900">Address:</span>{' '}
              {vendor.address || 'Not set'}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-900">Joined:</span>{' '}
              {vendor.created_at
                ? new Date(vendor.created_at).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}