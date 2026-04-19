import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient, createPublicClient, getPublicStorageUrl } from '@/lib/supabase/server'
import { createInquiry } from '@/app/inquiries/actions'
import { createOrder } from '@/app/(public)/orders/actions'
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  MapPin,
  ShieldCheck,
  Star,
  Package,
  Boxes,
  Truck,
} from 'lucide-react'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ message?: string }>
}

type ProductImage = {
  image_url: string | null
  is_primary: boolean | null
}

type ProductRecord = {
  id: string
  name: string
  slug: string | null
  description: string | null
  price: number | string | null
  stock: number | null
  min_order: number | null
  status: string | null
  vendor_id: string | null
  category_id: string | null
  product_images: ProductImage[] | null
}

type VendorRecord = {
  id: string
  company_name: string | null
  slug: string | null
  country: string | null
  city: string | null
  verified: boolean | null
  rating: number | null
}

type CategoryRecord = {
  id: string
  name: string | null
  slug: string | null
}

type ReviewRecord = {
  id: string
  rating: number | null
  comment: string | null
  created_at: string | null
}

type NormalizedImage = {
  image_url: string
  is_primary: boolean
}

function normalizeImageUrl(value?: string | null): string | null {
  const input = String(value ?? '').trim()
  if (!input) return null

  if (
    input.startsWith('http://') ||
    input.startsWith('https://') ||
    input.startsWith('/')
  ) {
    return input
  }

  return getPublicStorageUrl('products', input)
}

function normalizeImages(images: ProductImage[] | null | undefined): NormalizedImage[] {
  if (!Array.isArray(images) || images.length === 0) return []

  return images
    .map((image) => ({
      image_url: normalizeImageUrl(image?.image_url) || '',
      is_primary: Boolean(image?.is_primary),
    }))
    .filter((image) => image.image_url.length > 0)
}

function ProductImageFallback({ name }: { name: string }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('') || 'GT'

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-xl font-bold text-white shadow-sm">
          {initials}
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500">
          Product image unavailable
        </p>
      </div>
    </div>
  )
}

function formatCurrency(value: number | string | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = createPublicClient()

  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .maybeSingle()

  if (!product) {
    return {
      title: 'Product Not Found | GTH',
    }
  }

  return {
    title: `${product.name} | GTH`,
    description: product.description || 'Explore this product on GTH.',
  }
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  const { message } = await searchParams

  const publicSupabase = createPublicClient()
  const authSupabase = await createClient()

  const {
    data: { user },
  } = await authSupabase.auth.getUser()

  const { data: product, error: productError } = await publicSupabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      price,
      stock,
      min_order,
      status,
      vendor_id,
      category_id,
      product_images (
        image_url,
        is_primary
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()

  if (productError || !product) {
    notFound()
  }

  const typedProduct = product as ProductRecord

  const [{ data: vendor }, { data: category }, { data: reviews }] =
    await Promise.all([
      publicSupabase
        .from('vendors')
        .select('id, company_name, slug, country, city, verified, rating')
        .eq('id', typedProduct.vendor_id)
        .maybeSingle(),
      typedProduct.category_id
        ? publicSupabase
            .from('categories')
            .select('id, name, slug')
            .eq('id', typedProduct.category_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      publicSupabase
        .from('reviews')
        .select('id, rating, comment, created_at')
        .eq('product_id', typedProduct.id)
        .order('created_at', { ascending: false }),
    ])

  const normalizedImages = normalizeImages(typedProduct.product_images)
  const primaryImage =
    normalizedImages.find((image) => image.is_primary)?.image_url ||
    normalizedImages[0]?.image_url ||
    null
  const galleryImages = normalizedImages.length
    ? normalizedImages.slice(0, 4)
    : []

  const typedVendor = vendor as VendorRecord | null
  const typedCategory = category as CategoryRecord | null
  const typedReviews = (reviews || []) as ReviewRecord[]

  const minOrder = Math.max(1, Number(typedProduct.min_order ?? 1))
  const stock = Math.max(0, Number(typedProduct.stock ?? 0))
  const isErrorMessage =
    !!message &&
    /failed|invalid|not found|exceeds|error|cannot|missing|denied|violates|required/i.test(
      message
    )

  const location =
    [typedVendor?.city, typedVendor?.country].filter(Boolean).join(', ') ||
    typedVendor?.country ||
    'N/A'

  return (
    <main className="bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-slate-900">
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-900">{typedProduct.name}</span>
        </nav>

        {message ? (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 text-sm ${
              isErrorMessage
                ? 'border border-red-200 bg-red-50 text-red-700'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              {primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryImage}
                  alt={typedProduct.name}
                  className="h-full w-full object-cover"
                  loading="eager"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <ProductImageFallback name={typedProduct.name} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {galleryImages.length > 0
                ? galleryImages.map((image, index) => (
                    <div
                      key={`${image.image_url}-${index}`}
                      className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.image_url}
                        alt={`${typedProduct.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))
                : Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`fallback-${index}`}
                      className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                    >
                      <ProductImageFallback name={typedProduct.name} />
                    </div>
                  ))}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
                GTH Product Details
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                {typedProduct.name}
              </h1>

              {typedCategory?.name ? (
                <Link
                  href={
                    typedCategory.slug
                      ? `/categories/${typedCategory.slug}`
                      : '/categories'
                  }
                  className="mt-3 inline-block text-sm font-medium text-amber-600 hover:underline"
                >
                  {typedCategory.name}
                </Link>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Category not assigned</p>
              )}

              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  <Boxes className="h-4 w-4" />
                  Stock: {stock}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  <Package className="h-4 w-4" />
                  MOQ: {minOrder}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 capitalize text-slate-700">
                  <Truck className="h-4 w-4" />
                  {typedProduct.status || 'active'}
                </span>
              </div>

              <p className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                {formatCurrency(typedProduct.price)}
              </p>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <p className="whitespace-pre-line text-base leading-7 text-slate-700">
                  {typedProduct.description || 'No description available.'}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Supplier Information
              </h2>

              <div className="mt-4 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                  {(typedVendor?.company_name || 'GT').slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">
                    {typedVendor?.company_name || 'N/A'}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    {location}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {typedVendor?.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                        <BadgeCheck className="h-4 w-4" />
                        Verified
                      </span>
                    ) : null}

                    {typedVendor?.rating != null ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                        <Star className="h-4 w-4 text-amber-500" />
                        {Number(typedVendor.rating).toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {typedVendor?.slug ? (
                  <Link
                    href={`/vendors/${typedVendor.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    <Building2 className="h-4 w-4" />
                    View Supplier
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Place Order</h2>
              <p className="mt-2 text-sm text-slate-600">
                Submit a purchase order directly for this product through GTH.
              </p>

              {user ? (
                stock > 0 ? (
                  <form action={createOrder} className="mt-5 space-y-4">
                    <input type="hidden" name="product_id" value={typedProduct.id} />
                    <input
                      type="hidden"
                      name="return_to"
                      value={`/products/${typedProduct.slug || slug}`}
                    />

                    <div>
                      <label
                        htmlFor="quantity"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Quantity
                      </label>
                      <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min={minOrder}
                        max={stock}
                        defaultValue={minOrder}
                        required
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Minimum order quantity: {minOrder}. Available stock: {stock}.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600"
                    >
                      Place Order
                    </button>
                  </form>
                ) : (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">
                      This product is currently out of stock.
                    </p>
                  </div>
                )
              ) : (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    Please log in to place an order for this product.
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/login"
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Send Inquiry</h2>
              <p className="mt-2 text-sm text-slate-600">
                Contact the supplier directly about this product.
              </p>

              {user ? (
                <form action={createInquiry} className="mt-5 space-y-4">
                  <input type="hidden" name="product_id" value={typedProduct.id} />
                  <input type="hidden" name="vendor_id" value={typedProduct.vendor_id || ''} />
                  <input
                    type="hidden"
                    name="product_slug"
                    value={typedProduct.slug || slug}
                  />

                  <textarea
                    name="message"
                    rows={5}
                    required
                    placeholder={`Hello, I am interested in ${typedProduct.name}. Please share more details about price, availability, and shipping.`}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500"
                  />

                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Submit Inquiry
                  </button>
                </form>
              ) : (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    Please log in to send an inquiry to this supplier.
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/login"
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="mt-14">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            <h2 className="text-2xl font-bold text-slate-900">Customer Reviews</h2>
          </div>

          <div className="mt-6 space-y-4">
            {typedReviews.length ? (
              typedReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="font-semibold text-slate-900">
                    Rating: {review.rating ?? 'N/A'} / 5
                  </p>
                  <p className="mt-2 text-slate-700">
                    {review.comment || 'No comment'}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">
                No reviews yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}