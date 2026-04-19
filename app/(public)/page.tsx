import Link from 'next/link'
import { createPublicClient, getPublicStorageUrl } from '@/lib/supabase/server'
import { PublicHero } from '@/components/public/hero'
import { ProductCard } from '@/components/public/product-card'
import { VendorCard } from '@/components/public/vendor-card'
import { CategoryCard } from '@/components/public/category-card'

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type ProductImage = {
  image_url: string | null
  is_primary: boolean | null
}

type LatestProductRow = {
  id: string
  name: string | null
  slug: string | null
  price: number | string | null
  stock: number | null
  min_order: number | null
  vendor_id: string | null
  product_images: ProductImage[] | null
}

type VendorMiniRow = {
  id: string
  company_name: string | null
}

type FeaturedSupplierRow = {
  id: string
  company_name: string | null
  slug: string | null
  country: string | null
  city: string | null
  verified: boolean | null
  rating: number | null
  description: string | null
}

type CategoryRow = {
  id: string
  name: string
  slug: string | null
}

/* -------------------------------------------------------------------------- */
/*                              IMAGE RESOLUTION                              */
/* -------------------------------------------------------------------------- */

function resolveProductImageSrc(src?: string | null): string {
  const value = String(src || '').trim()

  if (!value) return '/placeholder.png'

  // Already a valid public URL
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  ) {
    return value
  }

  // Resolve Supabase Storage path
  const publicUrl = getPublicStorageUrl('products', value)
  return publicUrl || '/placeholder.png'
}

function getProductImage(images: ProductImage[] | null | undefined): string {
  if (!images || images.length === 0) return '/placeholder.png'

  const normalized = images
    .map((img) => ({
      ...img,
      image_url: resolveProductImageSrc(img?.image_url),
    }))
    .filter((img) => Boolean(img.image_url))

  if (normalized.length === 0) return '/placeholder.png'

  const primary = normalized.find((img) => img.is_primary)
  return primary?.image_url || normalized[0].image_url || '/placeholder.png'
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function HomePage() {
  const supabase = await createPublicClient()

  /* ----------------------------- Latest Products ---------------------------- */
  const { data: latestProductsData } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      stock,
      min_order,
      vendor_id,
      product_images (
        image_url,
        is_primary
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8)

  const latestProducts = (latestProductsData || []) as LatestProductRow[]

  /* ----------------------------- Vendor Mapping ----------------------------- */
  const vendorIds = Array.from(
    new Set(
      latestProducts
        .map((product) => product.vendor_id)
        .filter((id): id is string => Boolean(id))
    )
  )

  let vendorMap = new Map<string, { company_name: string | null }>()

  if (vendorIds.length > 0) {
    const { data: vendorsData } = await supabase
      .from('vendors')
      .select('id, company_name')
      .in('id', vendorIds)

    const vendors = (vendorsData || []) as VendorMiniRow[]

    vendorMap = new Map(
      vendors.map((vendor) => [
        vendor.id,
        { company_name: vendor.company_name },
      ])
    )
  }

  /* ----------------------------- Featured Vendors --------------------------- */
  const { data: featuredSuppliersData } = await supabase
    .from('vendors')
    .select(
      'id, company_name, slug, country, city, verified, rating, description'
    )
    .order('created_at', { ascending: false })
    .limit(6)

  const featuredSuppliers =
    (featuredSuppliersData || []) as FeaturedSupplierRow[]

  /* ----------------------------- Categories -------------------------------- */
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })
    .limit(8)

  const categories = (categoriesData || []) as CategoryRow[]

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <main className="bg-white text-slate-900">
      <PublicHero />

      {/* ===================== PRODUCTS ===================== */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
              Product Discovery
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Recommended products
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Explore active product listings from suppliers across the marketplace.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            View all products
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {latestProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name || 'Unnamed Product',
                slug: product.slug,
                price: Number(product.price ?? 0),
                stock: product.stock,
                min_order: product.min_order,
                image: getProductImage(product.product_images),
                vendorName:
                  vendorMap.get(product.vendor_id || '')?.company_name ||
                  'Verified Supplier',
              }}
            />
          ))}
        </div>
      </section>

      {/* ===================== SUPPLIERS ===================== */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
                Supplier Network
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Trusted suppliers
              </h2>
            </div>

            <Link
              href="/vendors"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Browse suppliers
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSuppliers.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CATEGORIES ===================== */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
              Categories for you
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Explore by category
            </h2>
          </div>

          <Link
            href="/categories"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            View categories
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={{
                id: category.id,
                name: category.name,
                slug: category.slug,
                productCount: 0,
              }}
            />
          ))}
        </div>
      </section>
    </main>
  )
}