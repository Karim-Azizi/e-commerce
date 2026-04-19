'use client'

import Link from 'next/link'
import { Package, ArrowUpRight } from 'lucide-react'

type CategoryCardProps = {
  category: {
    id: string
    name: string
    slug: string | null
    productCount?: number
  }
}

function getCategoryStyle(name: string) {
  const styles = [
    {
      gradient: 'from-orange-400 via-amber-300 to-yellow-200',
      badge: 'bg-orange-100 text-orange-700',
    },
    {
      gradient: 'from-blue-400 via-sky-300 to-indigo-200',
      badge: 'bg-blue-100 text-blue-700',
    },
    {
      gradient: 'from-emerald-400 via-teal-300 to-green-200',
      badge: 'bg-emerald-100 text-emerald-700',
    },
    {
      gradient: 'from-purple-400 via-fuchsia-300 to-pink-200',
      badge: 'bg-purple-100 text-purple-700',
    },
  ]

  const index = name.charCodeAt(0) % styles.length
  return styles[index]
}

export function CategoryCard({ category }: CategoryCardProps) {
  const style = getCategoryStyle(category.name || 'Category')
  const productCount = Number(category.productCount ?? 0)

  return (
    <Link
      href={`/categories/${category.slug || category.id}`}
      className="group relative overflow-hidden rounded-3xl border border-white/30 bg-white/60 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-20`}
      />

      {/* Glow Effects */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/30 blur-2xl" />

      <div className="relative z-10">
        {/* Icon & Badge */}
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-600">
            <Package className="h-6 w-6" />
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
          >
            {productCount} {productCount === 1 ? 'Product' : 'Products'}
          </span>
        </div>

        {/* Content */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-slate-900">
            {category.name || 'Unnamed Category'}
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Explore trusted suppliers and discover market-ready products in this category.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
            Browse Category
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}