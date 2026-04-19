import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient, getPublicStorageUrl } from '@/lib/supabase/server'
import { ProductForm } from '@/components/dashboard/products/product-form'
import { updateProduct } from '../../actions'
import {
  ArrowLeft,
  Building2,
  ImageIcon,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ message?: string }>
}

type Category = {
  id: string
  name: string
  slug: string | null
}

type ProductImageRow = {
  id?: string
  image_url?: string | null
  is_primary?: boolean | null
}

function resolveImageUrl(value?: string | null) {
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

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const { message } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id, company_name')
    .eq('user_id', user.id)
    .single()

  if (vendorError || !vendor) {
    redirect('/dashboard/onboarding/vendor')
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      description,
      category_id,
      price,
      stock,
      min_order,
      status,
      vendor_id,
      product_images (
        id,
        image_url,
        is_primary
      )
    `
    )
    .eq('id', id)
    .eq('vendor_id', vendor.id)
    .single()

  if (productError || !product) {
    notFound()
  }

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  const normalizedProduct = {
    id: product.id,
    name: product.name,
    description: product.description ?? '',
    category_id: product.category_id ?? '',
    price: Number(product.price ?? 0),
    stock: Number(product.stock ?? 0),
    min_order: Number(product.min_order ?? 1),
    status: product.status ?? 'active',
    vendor_id: product.vendor_id,
    product_images: ((product.product_images || []) as ProductImageRow[]).map(
      (img, index) => ({
        id: img.id || `${product.id}-${index}`,
        image_url: resolveImageUrl(img.image_url) || '/placeholder.png',
        is_primary: Boolean(img.is_primary),
      })
    ),
  }

  const isSuccessMessage = !!message && /success/i.test(message)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            GTH Commerce
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Edit Product
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Update product information, pricing, stock, and images for the GTH
            marketplace.
          </p>
        </div>

        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Editing product for:{' '}
        <span className="font-semibold">
          {vendor.company_name || 'Your Company'}
        </span>
      </div>

      {message ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isSuccessMessage
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      ) : null}

      {categoriesError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load categories: {categoriesError.message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <ProductForm
            action={async (formData: FormData) => {
              'use server'
              await updateProduct(id, formData)
            }}
            product={normalizedProduct as any}
            categories={((categories || []) as Category[])}
          />
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Product Summary
            </h3>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-slate-500" />
                Status:{' '}
                <span className="font-semibold capitalize text-slate-900">
                  {normalizedProduct.status}
                </span>
              </p>

              <p className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                Supplier:{' '}
                <span className="font-semibold text-slate-900">
                  {vendor.company_name}
                </span>
              </p>

              <p className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-slate-500" />
                Images:{' '}
                <span className="font-semibold text-slate-900">
                  {normalizedProduct.product_images.length}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              GTH Marketplace
            </p>
            <h3 className="mt-3 flex items-center gap-2 text-xl font-bold">
              <ShieldCheck className="h-5 w-5 text-amber-300" />
              Verified Supplier Listing
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Keep product details complete and images clear to improve buyer
              trust and marketplace visibility.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}