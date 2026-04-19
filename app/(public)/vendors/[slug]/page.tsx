import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createPublicClient, getPublicStorageUrl } from '@/lib/supabase/server'
import { MapPin, BadgeCheck, Star } from 'lucide-react'

type ProductImage = {
  image_url: string | null
  is_primary: boolean | null
}

function getProductImage(images: ProductImage[] | null | undefined) {
  if (!images || images.length === 0) return '/placeholder.png'
  const primary = images.find((img) => img?.is_primary && img?.image_url)
  return primary?.image_url || images[0]?.image_url || '/placeholder.png'
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createPublicClient()

  const { data: vendor } = await supabase
    .from('vendors')
    .select(
      'id, company_name, slug, country, city, address, description, verified, rating, created_at'
    )
    .eq('slug', slug)
    .maybeSingle()

  if (!vendor) notFound()

  const [{ data: store }, { data: products }, { count: productCount }] =
    await Promise.all([
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
        .order('created_at', { ascending: false }),
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendor.id)
        .eq('status', 'active'),
    ])

  return (
    <main className="bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-56 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600">
            {store?.banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.banner}
                alt={vendor.company_name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          <div className="px-6 pb-8">
            <div className="-mt-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-end gap-5">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-white text-2xl font-bold text-slate-900 shadow-sm">
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
                    GTH Supplier
                  </p>
                  <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                    {vendor.company_name}
                  </h1>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    {[vendor.city, vendor.country].filter(Boolean).join(', ') || 'Location not set'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {vendor.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
                    <BadgeCheck className="h-4 w-4" />
                    Verified Supplier
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                  <Star className="h-4 w-4 text-amber-500" />
                  {Number(vendor.rating ?? 0).toFixed(1)}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                  Products: {productCount ?? 0}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                  Theme: {store?.theme || 'Default'}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Company Overview
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
                  {vendor.description || 'No company description available.'}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Business Information
                </h2>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-900">Address:</span>{' '}
                    {vendor.address || 'Not set'}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Country:</span>{' '}
                    {vendor.country || 'Not set'}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">City:</span>{' '}
                    {vendor.city || 'Not set'}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Joined:</span>{' '}
                    {vendor.created_at
                      ? new Date(vendor.created_at).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
                Product Catalog
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Products by this supplier
              </h2>
            </div>
          </div>

          {(products || []).length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(products || []).map((product: any) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug || product.id}`}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
              No active products found for this supplier.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}