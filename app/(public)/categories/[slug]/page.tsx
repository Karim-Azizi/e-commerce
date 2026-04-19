import { notFound } from 'next/navigation'
import { createPublicClient, getPublicStorageUrl } from '@/lib/supabase/server'
import { ProductCard } from '@/components/public/product-card'

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createPublicClient()

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (!category) notFound()

  const { data: products } = await supabase
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
    .eq('category_id', category.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const vendorIds = Array.from(new Set((products || []).map((p) => p.vendor_id).filter(Boolean)))

  let vendorMap = new Map<string, { company_name: string | null }>()
  if (vendorIds.length > 0) {
    const { data: vendorsMini } = await supabase
      .from('vendors')
      .select('id, company_name')
      .in('id', vendorIds as string[])
    vendorMap = new Map((vendorsMini || []).map((v) => [v.id, { company_name: v.company_name }]))
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
        Category
      </p>
      <h1 className="mt-2 text-4xl font-bold">{category.name}</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(products || []).length ? (
          (products || []).map((product: any) => {
            const image =
              product.product_images?.find((img: any) => img.is_primary)?.image_url ||
              product.product_images?.[0]?.image_url ||
              null

            return (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  stock: product.stock,
                  min_order: product.min_order,
                  image,
                  vendorName: vendorMap.get(product.vendor_id)?.company_name || null,
                }}
              />
            )
          })
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
            No active products found in this category.
          </div>
        )}
      </div>
    </main>
  )
}