import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function InventoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!vendor) redirect('/dashboard/onboarding/vendor')

  const { data: products } = await supabase
    .from('products')
    .select('id, name, stock, status, created_at')
    .eq('vendor_id', vendor.id)
    .order('stock', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track stock levels and identify low-stock products.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">Stock</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {products?.length ? (
              products.map((product) => (
                <tr key={product.id} className="border-b border-slate-100">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">{product.stock ?? 0}</td>
                  <td className="px-6 py-4 capitalize">{product.status}</td>
                  <td className="px-6 py-4">
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString()
                      : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                  No inventory records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}