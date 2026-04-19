import { createPublicClient, getPublicStorageUrl } from '@/lib/supabase/server'
import { CategoryCard } from '@/components/public/category-card'

export default async function CategoriesPage() {
  const supabase = await createPublicClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  if (error) {
    return <main className="mx-auto max-w-7xl px-4 py-12 text-red-600">Failed to load categories.</main>
  }

  const categoryIds = (categories || []).map((c) => c.id)

  let countMap = new Map<string, number>()
  if (categoryIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('category_id')
      .in('category_id', categoryIds)
      .eq('status', 'active')

    for (const row of products || []) {
      const id = row.category_id as string | null
      if (id) countMap.set(id, (countMap.get(id) || 0) + 1)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
        Public Marketplace
      </p>
      <h1 className="mt-2 text-4xl font-bold">Categories</h1>
      <p className="mt-2 text-slate-600">Browse all marketplace categories.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(categories || []).map((category) => (
          <CategoryCard
            key={category.id}
            category={{
              id: category.id,
              name: category.name,
              slug: category.slug,
              productCount: countMap.get(category.id) || 0,
            }}
          />
        ))}
      </div>
    </main>
  )
}