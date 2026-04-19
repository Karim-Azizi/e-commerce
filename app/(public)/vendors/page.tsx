import { createPublicClient, getPublicStorageUrl } from '@/lib/supabase/server'
import { VendorCard } from '@/components/public/vendor-card'

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q || '').trim()

  const supabase = await createPublicClient()

  let request = supabase
    .from('vendors')
    .select('id, company_name, slug, country, city, verified, rating, description')
    .order('created_at', { ascending: false })

  if (query) {
    request = request.or(
      `company_name.ilike.%${query}%,country.ilike.%${query}%,city.ilike.%${query}%,description.ilike.%${query}%`
    )
  }

  const { data: vendors, error } = await request

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 text-red-600">
        Failed to load suppliers: {error.message}
      </main>
    )
  }

  const vendorIds = (vendors || []).map((vendor) => vendor.id)

  let productCountMap = new Map<string, number>()

  if (vendorIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('vendor_id')
      .in('vendor_id', vendorIds)
      .eq('status', 'active')

    for (const row of products || []) {
      const id = row.vendor_id as string | null
      if (id) {
        productCountMap.set(id, (productCountMap.get(id) || 0) + 1)
      }
    }
  }

  const { data: storeSettings } =
    vendorIds.length > 0
      ? await supabase
          .from('store_settings')
          .select('vendor_id, logo')
          .in('vendor_id', vendorIds)
      : { data: [] }

  const logoMap = new Map<string, string | null>()
  for (const row of storeSettings || []) {
    logoMap.set(row.vendor_id, row.logo || null)
  }

  return (
    <main className="bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            GTH Suppliers
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            {query ? `Suppliers matching "${query}"` : 'Suppliers'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Discover trusted companies, compare supplier profiles, and explore their
            public storefronts.
          </p>
        </div>

        {(vendors || []).length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(vendors || []).map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={{
                  ...vendor,
                  logo: logoMap.get(vendor.id) || null,
                  productCount: productCountMap.get(vendor.id) || 0,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            No suppliers found.
          </div>
        )}
      </div>
    </main>
  )
}