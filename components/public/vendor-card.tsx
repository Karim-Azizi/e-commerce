'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowUpRight, BadgeCheck, MapPin, Star, Store } from 'lucide-react'

type VendorCardProps = {
  vendor: {
    id: string
    company_name: string
    slug: string | null
    country: string | null
    city: string | null
    verified: boolean | null
    rating: number | null
    description: string | null
    logo?: string | null
    productCount?: number
  }
}

function isValidImageSrc(src?: string | null) {
  if (!src) return false
  const value = src.trim()
  if (!value) return false
  if (value === '/placeholder.png') return false
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')
}

function VendorLogoFallback({ companyName }: { companyName: string }) {
  const initials = useMemo(() => {
    const words = companyName.trim().split(/\s+/).filter(Boolean)
    if (words.length === 0) return 'GT'
    return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('')
  }, [companyName])

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-lg font-bold text-white">
      {initials}
    </div>
  )
}

export function VendorCard({ vendor }: VendorCardProps) {
  const initialLogo = isValidImageSrc(vendor.logo) ? vendor.logo!.trim() : null
  const [logoFailed, setLogoFailed] = useState(false)
  const showLogo = Boolean(initialLogo) && !logoFailed
  const location = [vendor.city, vendor.country].filter(Boolean).join(', ') || 'Location not specified'
  const rating = Number(vendor.rating ?? 0)
  const products = Number(vendor.productCount ?? 0)

  return (
    <Link
      href={`/vendors/${vendor.slug || vendor.id}`}
      className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
            {showLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={initialLogo!}
                alt={vendor.company_name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <VendorLogoFallback companyName={vendor.company_name || 'Vendor'} />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-slate-900 transition-colors group-hover:text-amber-700">
              {vendor.company_name || 'Unnamed Supplier'}
            </h3>

            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          </div>
        </div>

        {vendor.verified ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <BadgeCheck className="h-4 w-4" />
            Verified
          </span>
        ) : null}
      </div>

      <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-600">
        {vendor.description ||
          'Trusted supplier on GTH with marketplace-ready products and export support.'}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
            <Star className="h-4 w-4 text-amber-500" />
            {rating.toFixed(1)}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
            <Store className="h-4 w-4 text-slate-500" />
            Products: {products}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
          View Supplier
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </div>
    </Link>
  )
}