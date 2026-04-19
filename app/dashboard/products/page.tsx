import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient, getPublicStorageUrl } from '@/lib/supabase/server'
import { deleteProduct } from './actions'
import { Plus, Edit, Trash2, Package } from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*                         Helper: Resolve Image URL                          */
/* -------------------------------------------------------------------------- */
function resolveImageUrl(src?: string | null): string | null {
  if (!src) return null
  const value = src.trim()

  // If already a full URL or local asset
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  ) {
    return value
  }

  // Otherwise treat as Supabase storage path
  return getPublicStorageUrl('products', value)
}

/* -------------------------------------------------------------------------- */
/*                           Currency Formatter                               */
/* -------------------------------------------------------------------------- */
function formatCurrency(value: number | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

/* -------------------------------------------------------------------------- */
/*                              Products Page                                 */
/* -------------------------------------------------------------------------- */
export default async function ProductsPage() {
  const supabase = await createClient()

  /* ----------------------------- AUTHENTICATION ---------------------------- */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  /* ----------------------------- GET VENDOR -------------------------------- */
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (vendorError || !vendor) {
    redirect('/dashboard/onboarding/vendor')
  }

  /* ----------------------------- FETCH PRODUCTS ---------------------------- */
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      price,
      stock,
      status,
      slug,
      product_images (
        image_url,
        is_primary
      )
    `)
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`)
  }

  /* --------------------------- Normalize Images ---------------------------- */
  const normalizedProducts =
    products?.map((product) => {
      const images = Array.isArray(product.product_images)
        ? product.product_images
        : []

      const primary =
        images.find((img) => img.is_primary)?.image_url ||
        images[0]?.image_url ||
        null

      return {
        ...product,
        image: resolveImageUrl(primary),
      }
    }) || []

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Product</th>
              <th className="p-4 font-semibold text-slate-600">Price</th>
              <th className="p-4 font-semibold text-slate-600">Stock</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {normalizedProducts.length > 0 ? (
              normalizedProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-t transition hover:bg-slate-50"
                >
                  {/* Product Info with Image */}
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          ID: {product.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="p-4 font-medium text-slate-700">
                    {formatCurrency(product.price)}
                  </td>

                  {/* Stock */}
                  <td className="p-4 text-slate-700">{product.stock}</td>

                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>

                      <form
                        action={async () => {
                          'use server'
                          await deleteProduct(product.id)
                        }}
                        className="inline"
                      >
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 text-red-600 hover:underline"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-slate-500"
                >
                  No products found. Start by adding your first product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}