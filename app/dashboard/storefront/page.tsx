import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type ProductImage = {
  image_url: string | null
  is_primary: boolean | null
}

function getProductImage(images: ProductImage[] | null | undefined) {
  if (!images || images.length === 0) return '/placeholder.png'
  const primary = images.find((img) => img?.is_primary && img?.image_url)
  return primary?.image_url || images[0]?.image_url || '/placeholder.png'
}

export default async function StorefrontPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, company_name, slug, verified, rating, country, city, description')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!vendor) redirect('/dashboard/onboarding/vendor')

  const [{ data: store }, { data: products }] = await Promise.all([
    supabase
      .from('store_settings')
      .select('logo, banner, theme')
      .eq('vendor_id', vendor.id)
      .maybeSingle(),
    supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        stock,
        min_order,
        status,
        product_images (
          image_url,
          is_primary
        )
      `)
      .eq('vendor_id', vendor.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-52 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600">
          {store?.banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.banner}
              alt={vendor.company_name}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-white text-2xl font-bold text-slate-900 shadow-sm">
                {store?.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.logo}
                    alt={vendor.company_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  vendor.company_name.slice(0, 2).toUpperCase()
                )}
              </div>

              <div className="pb-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
                  Public Storefront Preview
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  {vendor.company_name}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {[vendor.city, vendor.country].filter(Boolean).join(', ') || 'Location not set'}
                </p>
              </div>
            </div>

            {vendor.slug ? (
              <Link
                href={`/vendors/${vendor.slug}`}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Open Public Page
              </Link>
            ) : null}
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

          <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-700">
            {vendor.description || 'No storefront description available yet.'}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Featured Supplier Products
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              This is how products can appear on your public supplier page.
            </p>
          </div>
          <Link
            href="/dashboard/products"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Manage Products
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(products || []).length ? (
            (products || []).map((product: any) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getProductImage(product.product_images)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-2 font-semibold text-slate-900">
                    {product.name}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      Stock: {product.stock ?? 0}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      MOQ: {product.min_order ?? 1}
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-bold text-slate-900">
                    ${Number(product.price ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              No active products found for storefront preview.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}