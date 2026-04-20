// app/(public)/page.tsx

import Link from 'next/link'
import { createPublicClient, getPublicStorageUrl } from '@/lib/supabase/server'
import { PublicHero } from '@/components/public/hero'
import { ProductCard } from '@/components/public/product-card'
import { VendorCard } from '@/components/public/vendor-card'
import { CategoryCard } from '@/components/public/category-card'

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

/* ---------------- IMAGE ---------------- */
function resolveProductImageSrc(src?: string | null): string {
  const value = String(src || '').trim()

  if (!value) return '/placeholder.png'

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  ) {
    return value
  }

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

/* ---------------- PAGE ---------------- */
export default async function HomePage() {
  const supabase = await createPublicClient()

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

  const { data: featuredSuppliersData } = await supabase
    .from('vendors')
    .select(
      'id, company_name, slug, country, city, verified, rating, description'
    )
    .order('created_at', { ascending: false })
    .limit(6)

  const featuredSuppliers =
    (featuredSuppliersData || []) as FeaturedSupplierRow[]

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })
    .limit(8)

  const categories = (categoriesData || []) as CategoryRow[]

  return (
    <main className="bg-gray-50 text-slate-900">

      {/* DESKTOP HERO ONLY */}
      <div className="hidden md:block">
        <PublicHero />
      </div>

      {/* ================= PRODUCTS ================= */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold md:text-3xl">
            Recommended products
          </h2>

          <Link
            href="/products"
            className="text-xs font-medium text-orange-500 md:text-sm"
          >
            View all
          </Link>
        </div>

        {/* MOBILE 2 COL / DESKTOP SAME */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
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

      {/* ================= SUPPLIERS ================= */}
      <section className="bg-white px-3 py-6 sm:px-6 lg:px-8 border-y">

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold md:text-3xl">
            Trusted suppliers
          </h2>

          <Link
            href="/vendors"
            className="text-xs font-medium text-orange-500 md:text-sm"
          >
            Browse
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {featuredSuppliers.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={{
                ...vendor,
                company_name: vendor.company_name || 'Supplier',
              }}
            />
          ))}
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold md:text-3xl">
            Categories
          </h2>

          <Link
            href="/categories"
            className="text-xs font-medium text-orange-500 md:text-sm"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
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