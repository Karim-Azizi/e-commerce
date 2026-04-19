'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Box,
  PackageCheck,
  Store,
  ShieldCheck,
  BadgeDollarSign,
} from 'lucide-react'

type ProductCardProps = {
  product: {
    id: string
    name: string
    slug: string | null
    price: number | null
    stock: number | null
    min_order: number | null
    image?: string | null
    vendorName?: string | null
  }
}

/* -------------------------------------------------------------------------- */
/*                              IMAGE UTILITIES                               */
/* -------------------------------------------------------------------------- */

function isAbsoluteUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://')
}

function isRootRelativeUrl(value: string) {
  return value.startsWith('/')
}

function normalizeImageSrc(src?: string | null): string | null {
  if (!src) return null

  const value = src.trim()

  if (!value) return null
  if (value === 'null' || value === 'undefined') return null
  if (value === '/placeholder.png') return '/placeholder.png'

  if (isAbsoluteUrl(value)) {
    try {
      return new URL(value).toString()
    } catch {
      try {
        return encodeURI(value)
      } catch {
        return null
      }
    }
  }

  if (isRootRelativeUrl(value)) {
    try {
      return encodeURI(value)
    } catch {
      return value
    }
  }

  /**
   * If a raw storage path slips through here, this component should not guess
   * the bucket URL on the client. Return null so the fallback UI is shown
   * instead of rendering a broken image.
   */
  return null
}

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

function ProductImageFallback({ name }: { name: string }) {
  const initials = useMemo(() => {
    const words = name.trim().split(/\s+/).filter(Boolean)

    if (words.length === 0) return 'GT'

    return words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('')
  }, [name])

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200">
      <div className="flex flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-sm">
          {initials}
        </div>
        <p className="mt-3 text-xs font-medium text-slate-500">
          Product image unavailable
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export function ProductCard({ product }: ProductCardProps) {
  const normalizedSrc = useMemo(
    () => normalizeImageSrc(product.image),
    [product.image]
  )

  const [imageFailed, setImageFailed] = useState(false)

  const productUrl = `/products/${product.slug || product.id}`
  const stock = Math.max(0, Number(product.stock ?? 0))
  const moq = Math.max(1, Number(product.min_order ?? 1))
  const showImage = Boolean(normalizedSrc) && !imageFailed
  const isOutOfStock = stock <= 0

  return (
    <Link
      href={productUrl}
      className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
      aria-label={`View ${product.name || 'product'}`}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={normalizedSrc || ''}
            alt={product.name || 'Product image'}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ProductImageFallback name={product.name || 'Product'} />
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 via-slate-950/25 to-transparent p-4">
          <div className="flex flex-wrap items-center gap-2">
            {isOutOfStock ? (
              <span className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                Out of Stock
              </span>
            ) : (
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900">
                Ready Stock
              </span>
            )}

            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900">
              MOQ {moq}
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="line-clamp-2 min-h-[3rem] text-[15px] font-semibold leading-6 text-slate-900 transition-colors group-hover:text-amber-600">
          {product.name || 'Unnamed Product'}
        </h3>

        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <Store className="h-3.5 w-3.5 text-slate-400" />
          <span className="line-clamp-1">
            Supplier:{' '}
            <span className="font-medium text-slate-700">
              {product.vendorName || 'Verified Supplier'}
            </span>
          </span>
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            <PackageCheck className="h-3.5 w-3.5" />
            Stock: {stock}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            <Box className="h-3.5 w-3.5" />
            MOQ: {moq}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1 text-lg font-bold tracking-tight text-slate-900">
              <BadgeDollarSign className="h-4 w-4 text-amber-600" />
              {formatCurrency(product.price)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Trade price displayed in USD
            </p>
          </div>

          <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
            View
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}