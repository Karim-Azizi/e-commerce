import Link from 'next/link'
import { createPublicClient, getPublicStorageUrl } from '@/lib/supabase/server'
import { ProductCard } from '@/components/public/product-card'
import {
  Search,
  Package,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

type SearchParams = Promise<{
  q?: string
  page?: string
}>

type ProductImage = {
  image_url: string | null
  is_primary: boolean | null
}

type ProductRow = {
  id: string
  name: string
  slug: string | null
  price: number | string | null
  stock: number | null
  min_order: number | null
  vendor_id: string | null
  status: string | null
  product_images: ProductImage[] | null
}

type VendorRow = {
  id: string
  company_name: string | null
}

const PAGE_SIZE = 12
const BASE_PATH = '/'

function resolveImageUrl(src?: string | null): string {
  const value = String(src ?? '').trim()

  if (!value) return '/placeholder.png'

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  ) {
    return value
  }

  return getPublicStorageUrl('products', value) || '/placeholder.png'
}

function getProductImage(images: ProductImage[] | null | undefined): string {
  if (!images || images.length === 0) return '/placeholder.png'

  const normalizedImages = images
    .map((img) => ({
      ...img,
      image_url: resolveImageUrl(img?.image_url),
    }))
    .filter((img) => Boolean(img.image_url))

  if (normalizedImages.length === 0) return '/placeholder.png'

  const primary = normalizedImages.find((img) => img.is_primary)

  return primary?.image_url || normalizedImages[0]?.image_url || '/placeholder.png'
}

function buildPageHref(page: number, query?: string) {
  const params = new URLSearchParams()

  if (page > 1) {
    params.set('page', String(page))
  }

  if (query) {
    params.set('q', query)
  }

  const qs = params.toString()
  return qs ? `${BASE_PATH}?${qs}` : BASE_PATH
}

function getPaginationNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, -1, totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages]
}

function Pagination({
  currentPage,
  totalPages,
  query,
}: {
  currentPage: number
  totalPages: number
  query?: string
}) {
  if (totalPages <= 1) return null

  const items = getPaginationNumbers(currentPage, totalPages)

  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <div className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href={buildPageHref(1, query)}
          aria-disabled={currentPage === 1}
          className={`inline-flex h-10 items-center gap-1 rounded-xl border px-3 text-sm font-medium transition ${
            currentPage === 1
              ? 'pointer-events-none border-slate-200 bg-slate-100 text-slate-400'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ChevronsLeft className="h-4 w-4" />
          First
        </Link>

        <Link
          href={buildPageHref(Math.max(1, currentPage - 1), query)}
          aria-disabled={currentPage === 1}
          className={`inline-flex h-10 items-center gap-1 rounded-xl border px-3 text-sm font-medium transition ${
            currentPage === 1
              ? 'pointer-events-none border-slate-200 bg-slate-100 text-slate-400'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Link>

        {items.map((item, index) =>
          item === -1 ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-10 items-center px-2 text-sm font-medium text-slate-400"
            >
              ...
            </span>
          ) : (
            <Link
              key={item}
              href={buildPageHref(item, query)}
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
                item === currentPage
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item}
            </Link>
          )
        )}

        <Link
          href={buildPageHref(Math.min(totalPages, currentPage + 1), query)}
          aria-disabled={currentPage === totalPages}
          className={`inline-flex h-10 items-center gap-1 rounded-xl border px-3 text-sm font-medium transition ${
            currentPage === totalPages
              ? 'pointer-events-none border-slate-200 bg-slate-100 text-slate-400'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Link>

        <Link
          href={buildPageHref(totalPages, query)}
          aria-disabled={currentPage === totalPages}
          className={`inline-flex h-10 items-center gap-1 rounded-xl border px-3 text-sm font-medium transition ${
            currentPage === totalPages
              ? 'pointer-events-none border-slate-200 bg-slate-100 text-slate-400'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Last
          <ChevronsRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const query = String(params?.q ?? '').trim()

  const requestedPage = Number(params?.page || '1')
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1

  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createPublicClient()

  let productsQuery = supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      price,
      stock,
      min_order,
      vendor_id,
      status,
      product_images (
        image_url,
        is_primary
      )
    `,
      { count: 'exact' }
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to)

  let countQuery = supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  if (query) {
    productsQuery = productsQuery.ilike('name', `%${query}%`)
    countQuery = countQuery.ilike('name', `%${query}%`)
  }

  const [{ data, error }, { count, error: countError }] = await Promise.all([
    productsQuery,
    countQuery,
  ])

  if (error || countError) {
    return (
      <main className="bg-white text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            Failed to load products: {error?.message || countError?.message}
          </div>
        </div>
      </main>
    )
  }

  const totalProducts = count || 0
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE))

  const safeCurrentPage =
    currentPage > totalPages && totalProducts > 0 ? totalPages : currentPage

  if (safeCurrentPage !== currentPage) {
    const restartFrom = (safeCurrentPage - 1) * PAGE_SIZE
    const restartTo = restartFrom + PAGE_SIZE - 1

    let fallbackQuery = supabase
      .from('products')
      .select(
        `
        id,
        name,
        slug,
        price,
        stock,
        min_order,
        vendor_id,
        status,
        product_images (
          image_url,
          is_primary
        )
      `
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(restartFrom, restartTo)

    if (query) {
      fallbackQuery = fallbackQuery.ilike('name', `%${query}%`)
    }

    const { data: fallbackData, error: fallbackError } = await fallbackQuery

    if (fallbackError) {
      return (
        <main className="bg-white text-slate-900">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              Failed to load products: {fallbackError.message}
            </div>
          </div>
        </main>
      )
    }

    const products = (fallbackData || []) as ProductRow[]
    const vendorIds = Array.from(
      new Set(
        products
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

      const vendors: VendorRow[] = (vendorsData || []) as VendorRow[]

      vendorMap = new Map(
        vendors.map((vendor) => [
          vendor.id,
          { company_name: vendor.company_name },
        ])
      )
    }

    return (
      <main className="bg-white text-slate-900">
        <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
              GTH Marketplace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {query ? `Search Results for "${query}"` : 'Products'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              {query
                ? 'Explore products matching your search across trusted suppliers on Global Trade House.'
                : 'Browse all available products from verified suppliers and discover international sourcing opportunities on GTH.'}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified marketplace
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">
                <Package className="h-3.5 w-3.5" />
                {totalProducts} product{totalProducts === 1 ? '' : 's'}
              </span>
              {query ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 font-semibold text-blue-700">
                  <Search className="h-3.5 w-3.5" />
                  Search active
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug || product.id,
                  price: Number(product.price ?? 0),
                  stock: Number(product.stock ?? 0),
                  min_order: Number(product.min_order ?? 1),
                  image: getProductImage(product.product_images),
                  vendorName:
                    vendorMap.get(product.vendor_id || '')?.company_name ||
                    'Verified Supplier',
                }}
              />
            ))}
          </div>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            query={query}
          />
        </div>
      </main>
    )
  }

  const products: ProductRow[] = (data || []) as ProductRow[]

  const vendorIds = Array.from(
    new Set(
      products
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

    const vendors: VendorRow[] = (vendorsData || []) as VendorRow[]

    vendorMap = new Map(
      vendors.map((vendor) => [
        vendor.id,
        { company_name: vendor.company_name },
      ])
    )
  }

  return (
    <main className="bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            GTH Marketplace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {query ? `Search Results for "${query}"` : 'Products'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            {query
              ? 'Explore products matching your search across trusted suppliers on Global Trade House.'
              : 'Browse all available products from verified suppliers and discover international sourcing opportunities on GTH.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified marketplace
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">
              <Package className="h-3.5 w-3.5" />
              {totalProducts} product{totalProducts === 1 ? '' : 's'}
            </span>
            {query ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 font-semibold text-blue-700">
                <Search className="h-3.5 w-3.5" />
                Search active
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {products.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug || product.id,
                    price: Number(product.price ?? 0),
                    stock: Number(product.stock ?? 0),
                    min_order: Number(product.min_order ?? 1),
                    image: getProductImage(product.product_images),
                    vendorName:
                      vendorMap.get(product.vendor_id || '')?.company_name ||
                      'Verified Supplier',
                  }}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              query={query}
            />
          </>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No products found
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Try another search term or browse all available product categories on GTH.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}