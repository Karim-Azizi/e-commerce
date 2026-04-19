'use client'

type Category = {
  id: string
  name: string
  slug?: string | null
}

type ProductFormProps = {
  action: (formData: FormData) => void | Promise<void>
  product?: {
    name?: string | null
    description?: string | null
    category_id?: string | null
    price?: number | null
    stock?: number | null
    min_order?: number | null
  } | null
  categories: Category[]
}

export function ProductForm({
  action,
  product,
  categories,
}: ProductFormProps) {
  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
          Product Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={product?.name || ''}
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="HOWO NX 6x4 Dump Truck"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={product?.description || ''}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="Write product details"
        />
      </div>

      <div>
        <label
          htmlFor="category_id"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Category
        </label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={product?.category_id || ''}
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {categories.length === 0 ? (
          <p className="mt-2 text-sm text-red-600">
            No categories found. Add or seed categories first.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-medium text-slate-700">
            Price
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            name="price"
            defaultValue={product?.price ?? ''}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="12000"
          />
        </div>

        <div>
          <label htmlFor="stock" className="mb-2 block text-sm font-medium text-slate-700">
            Stock
          </label>
          <input
            id="stock"
            type="number"
            name="stock"
            defaultValue={product?.stock ?? ''}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="10"
          />
        </div>

        <div>
          <label
            htmlFor="min_order"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Min Order
          </label>
          <input
            id="min_order"
            type="number"
            name="min_order"
            defaultValue={product?.min_order ?? 1}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="1"
          />
        </div>
      </div>

      {!product ? (
        <div>
          <label htmlFor="images" className="mb-2 block text-sm font-medium text-slate-700">
            Product Images
          </label>
          <input
            id="images"
            type="file"
            name="images"
            multiple
            accept="image/*"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
      >
        {product ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  )
}