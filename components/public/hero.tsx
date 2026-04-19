'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  PackageSearch,
  TrendingUp,
  WandSparkles,
} from 'lucide-react'
import clsx from 'clsx'

type Slide = {
  image: string
  title: string
  subtitle: string
}

const fallbackImage = '/placeholder.png'

/* -------------------------------------------------------------------------- */
/*                                SLIDES DATA                                 */
/* -------------------------------------------------------------------------- */

const slides: Slide[] = [
  {
    image:
      'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?q=80&w=1600&auto=format&fit=crop',
    title: 'Source Smarter with GTH',
    subtitle: 'Connect with global suppliers and grow your business',
  },
  {
    image:
      'https://images.unsplash.com/photo-1581092919535-7146ff1a590c?q=80&w=1600&auto=format&fit=crop',
    title: 'Discover Verified Suppliers',
    subtitle: 'Reliable partners for your sourcing needs',
  },
  {
    image:
      'https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1600&auto=format&fit=crop',
    title: 'Global Trade Made Easy',
    subtitle: 'From discovery to payment, all in one platform',
  },
]

const categories = [
  'Apparel & Accessories',
  'Consumer Electronics',
  'Industrial Machinery',
  'Tools & Hardware',
  'Home & Garden',
  'Renewable Energy',
  'Vehicle Parts',
  'Construction Machinery',
]

const quickLinks = [
  { label: 'Request for Quotation', href: '/rfqs', icon: PackageSearch },
  { label: 'Top Ranking', href: '/products?sort=top', icon: TrendingUp },
  { label: 'Fast Customization', href: '/products?filter=custom', icon: WandSparkles },
]

const trendingSearches = [
  'Laptops',
  'Solar Panels',
  'Electric Cars',
  'Handbags',
  'Electric Scooters',
]

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

function normalizeImageUrl(url: string) {
  const value = String(url || '').trim()
  if (!value) return fallbackImage
  try {
    return encodeURI(value)
  } catch {
    return fallbackImage
  }
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export function PublicHero() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [failedSlides, setFailedSlides] = useState<boolean[]>(
    slides.map(() => false)
  )

  /* -------------------------- Auto Slide Rotation ------------------------- */
  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => window.clearInterval(interval)
  }, [])

  /* ------------------------------ Preload Images --------------------------- */
  useEffect(() => {
    slides.forEach((slide, index) => {
      const img = new window.Image()
      img.src = normalizeImageUrl(slide.image)
      img.onerror = () => {
        setFailedSlides((prev) => {
          if (prev[index]) return prev
          const next = [...prev]
          next[index] = true
          return next
        })
      }
    })
  }, [])

  const resolvedSlides = useMemo(
    () =>
      slides.map((slide, index) => ({
        ...slide,
        image: failedSlides[index]
          ? fallbackImage
          : normalizeImageUrl(slide.image),
      })),
    [failedSlides]
  )

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = query.trim()
    router.push(value ? `/products?q=${encodeURIComponent(value)}` : '/products')
  }

  return (
    <section className="relative overflow-hidden">
      {/* ------------------------------------------------------------------- */}
      {/* Background Slideshow                                                */}
      {/* ------------------------------------------------------------------- */}
      <div className="absolute inset-0">
        {resolvedSlides.map((slide, index) => (
          <div
            key={index}
            className={clsx(
              'absolute inset-0 transition-opacity duration-1000',
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${slide.image}")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
          </div>
        ))}
      </div>

      {/* Decorative Blurs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-[-4rem] h-48 w-48 rounded-full bg-orange-400/30 blur-3xl" />
        <div className="absolute right-[-4rem] top-12 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Content                                                             */}
      {/* ------------------------------------------------------------------- */}
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid items-stretch gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* -------------------------- Category Sidebar ------------------------- */}
          <aside className="hidden rounded-2xl border border-white/25 bg-white/60 p-4 backdrop-blur-xl shadow-lg lg:block">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Categories for you
            </h2>
            <div className="space-y-1">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/categories?name=${encodeURIComponent(category)}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-white/80 hover:text-[#ff6a00]"
                >
                  <span className="line-clamp-1">{category}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </aside>

          {/* ------------------------------- Main Hero ----------------------------- */}
          <div className="min-w-0">
            <div className="flex min-h-[420px] flex-col justify-center rounded-3xl border border-white/20 bg-white/10 px-5 py-6 shadow-2xl backdrop-blur-2xl sm:px-7 sm:py-7 lg:min-h-[480px] xl:min-h-[520px]">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  Welcome to GTH
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-white">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Trusted B2B sourcing
                </span>
              </div>

              {/* Title */}
              <h1 className="mt-4 max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {resolvedSlides[currentSlide].title}
              </h1>

              {/* Subtitle */}
              <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
                {resolvedSlides[currentSlide].subtitle}
              </p>

              {/* Search Bar */}
              <div className="mt-6">
                <form
                  onSubmit={onSearchSubmit}
                  className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-lg lg:flex-row"
                >
                  <div className="flex flex-1 items-center gap-2 px-3">
                    <Search className="h-5 w-5 text-slate-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="What are you looking for?"
                      className="h-10 w-full border-0 bg-transparent text-sm text-slate-900 outline-none sm:h-11 sm:text-base"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#ff6a00] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#eb6200] sm:text-base"
                  >
                    Search
                  </button>
                </form>
              </div>

              {/* Quick Links */}
              <div className="mt-5 flex flex-wrap gap-2">
                {quickLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20 sm:text-sm"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              {/* Trending Searches */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="text-slate-200">Frequently searched:</span>
                {trendingSearches.map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      router.push(`/products?q=${encodeURIComponent(item)}`)
                    }
                    className="rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Slide Indicators */}
              <div className="mt-6 flex justify-center gap-2">
                {resolvedSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={clsx(
                      'h-2 rounded-full transition-all',
                      index === currentSlide
                        ? 'w-6 bg-[#ff6a00]'
                        : 'w-2 bg-white/60'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Feature Cards */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {quickLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group rounded-xl border border-white/30 bg-white/60 p-4 shadow-md backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/80"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-[#ff6a00]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-slate-900 sm:text-base">
                      {item.label}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                      {item.label === 'Request for Quotation' &&
                        'Post sourcing needs and receive supplier offers.'}
                      {item.label === 'Top Ranking' &&
                        'Explore fast-moving and trending products.'}
                      {item.label === 'Fast Customization' &&
                        'Find suppliers ready for private label production.'}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}