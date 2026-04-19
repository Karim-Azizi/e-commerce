import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, created_at')
    .order('name', { ascending: true })

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load categories: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            Commerce
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Categories
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Organize products into clear marketplace categories.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Slug</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Type</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Created</th>
            </tr>
          </thead>
          <tbody>
            {categories?.length ? (
              categories.map((category) => (
                <tr key={category.id} className="border-b border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {category.slug || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {category.parent_id ? 'Child' : 'Main'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {category.created_at
                      ? new Date(category.created_at).toLocaleDateString()
                      : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                  No categories found. Seed categories first in SQL editor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
        Tip: categories shown here are the same categories used by the product form.
      </div>
    </div>
  )
}