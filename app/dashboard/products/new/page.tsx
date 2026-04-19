import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/dashboard/products/product-form'
import { createProduct } from '../actions'
import { ArrowLeft, Building2, ImagePlus, PackagePlus, ShieldCheck } from 'lucide-react'

type Category = {
  id: string
  name: string
  slug: string | null
}

type SearchParams = Promise<{
  message?: string
}>

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
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

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  const hasCategories = Boolean(categories && categories.length > 0)
  const isSuccessMessage = !!message && /success/i.test(message)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            GTH Commerce
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Add New Product
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Create a marketplace-ready product with structured details, category
            mapping, pricing, stock, and image uploads for Global Trade House.
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

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-amber-50 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Supplier product publishing
                </div>

                <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
                  Product submission workspace
                </h2>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Add complete product details so your item looks professional,
                  trustworthy, and ready for buyer discovery across the GTH marketplace.
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <PackagePlus className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Supplier
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  {vendor.company_name || 'Your Company'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Categories
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {categories?.length || 0} available
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Media
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ImagePlus className="h-4 w-4 text-slate-500" />
                  Upload product images
                </p>
              </div>
            </div>
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

          {!hasCategories && !categoriesError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              No categories are available yet. Please add categories first before creating a product.
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <ProductForm
              action={createProduct}
              categories={(categories || []) as Category[]}
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Publishing tips
            </h3>

            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Use a clear product name</p>
                <p className="mt-1 leading-6">
                  Include brand, model, size, power, or specification so buyers can understand the product immediately.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Upload quality images</p>
                <p className="mt-1 leading-6">
                  Sharp product photos improve trust and help your product display better across the marketplace.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Set accurate stock and MOQ</p>
                <p className="mt-1 leading-6">
                  Reliable availability and minimum order values help reduce buyer confusion and improve conversion.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              GTH supplier workflow
            </p>
            <h3 className="mt-3 text-xl font-bold">
              Build a stronger product listing
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Strong title, correct category, clean images, and realistic pricing make your listing more marketplace-ready.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}