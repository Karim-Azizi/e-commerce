'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Camera,
  ChevronDown,
  CreditCard,
  Globe,
  Headphones,
  LayoutGrid,
  MapPin,
  Menu,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  User,
  X,
} from 'lucide-react'
import { logout } from '@/app/auth/actions'

type PublicNavbarProps = {
  user: {
    name: string
    email: string
    role: string
  } | null
}

function TopLink({
  href,
  children,
  icon,
}: {
  href: string
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-600 transition hover:text-slate-950"
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}

function MainTab({
  href,
  label,
  pathname,
}: {
  href: string
  label: string
  pathname: string
}) {
  const active = pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={`relative inline-flex items-center px-1 py-4 text-[15px] font-semibold transition ${
        active ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      {label}
      {active ? (
        <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-slate-950" />
      ) : null}
    </Link>
  )
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

function MobileShortcut({
  href,
  icon,
  label,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm transition hover:bg-slate-50"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">
        {icon}
      </div>
      <span className="line-clamp-1 text-[11px] font-medium text-slate-700">
        {label}
      </span>
    </Link>
  )
}

export function PublicNavbar({ user }: PublicNavbarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentQuery = useMemo(() => searchParams.get('q') || '', [searchParams])

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = ''
      return
    }

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  const closeMobileMenu = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      {/* ===================== MOBILE APP HEADER ===================== */}
      <div className="lg:hidden">
        <div className="border-b border-slate-200 bg-white px-3 py-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-white shadow-sm">
                GTH
              </div>
              <div className="min-w-0 leading-none">
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">
                  GTH
                </p>
              </div>
            </Link>

            <form
              action="/products"
              method="GET"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-slate-100 px-3 py-2"
            >
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                name="q"
                defaultValue={currentQuery}
                aria-label="Search products"
                placeholder="What are you looking for?"
                className="h-6 w-full min-w-0 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                aria-label="Image search"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200"
              >
                <Camera className="h-4 w-4" />
              </button>
              <button
                type="submit"
                aria-label="Search"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition hover:bg-slate-50"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-white px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/products"
              className="whitespace-nowrap rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Products
            </Link>
            <Link
              href="/vendors"
              className="whitespace-nowrap rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Suppliers
            </Link>
            <Link
              href="/rfqs"
              className="whitespace-nowrap rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              RFQs
            </Link>
            <Link
              href="/orders"
              className="whitespace-nowrap rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Orders
            </Link>
            <Link
              href="/payments"
              className="whitespace-nowrap rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Payments
            </Link>
          </div>
        </div>
      </div>

      {/* ===================== DESKTOP TOP UTILITY BAR ===================== */}
      <div className="hidden border-b border-slate-200 bg-slate-50 xl:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-7">
            <TopLink href="/categories">
              All Categories
              <ChevronDown className="h-3.5 w-3.5" />
            </TopLink>
            <TopLink href="/products">Featured Products</TopLink>
            <TopLink
              href="/about"
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
            >
              Order Protection
            </TopLink>
            <TopLink
              href="/support"
              icon={<Headphones className="h-3.5 w-3.5" />}
            >
              Help Center
            </TopLink>
          </div>

          <div className="flex items-center gap-7">
            <TopLink
              href="/contact"
              icon={<MapPin className="h-3.5 w-3.5" />}
            >
              Deliver to: ID
            </TopLink>
            <TopLink
              href="/contact"
              icon={<Globe className="h-3.5 w-3.5" />}
            >
              English-IDR
            </TopLink>
            <Link
              href="/dashboard/onboarding/vendor"
              className="text-xs font-semibold text-amber-700 transition hover:text-amber-800"
            >
              Become a Supplier
            </Link>
          </div>
        </div>
      </div>

      {/* ===================== DESKTOP MAIN HEADER ===================== */}
      <div className="hidden lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5 sm:px-6 lg:gap-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-xl font-bold text-white shadow-sm">
              GTH
            </div>

            <div className="min-w-0 leading-none">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-600">
                Global Trade House
              </p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 lg:block">
            <form
              action="/products"
              method="GET"
              className="mx-auto flex w-full max-w-[640px] items-center rounded-full border-2 border-amber-500 bg-white p-1.5 shadow-[0_6px_22px_rgba(15,23,42,0.06)]"
            >
              <div className="flex shrink-0 items-center gap-1 rounded-full px-4 py-2.5 text-sm font-medium text-slate-700">
                <span>Products</span>
                <ChevronDown className="h-4 w-4" />
              </div>

              <div className="mx-2 h-7 w-px shrink-0 bg-slate-200" />

              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                <input
                  name="q"
                  defaultValue={currentQuery}
                  aria-label="Search products"
                  placeholder="What are you looking for?"
                  className="h-11 w-full min-w-0 border-0 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-7 text-sm font-semibold text-white shadow-sm transition hover:from-amber-600 hover:to-orange-600"
              >
                Search
              </button>
            </form>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <QuickAction
              href="/orders"
              icon={<ShoppingCart className="h-4.5 w-4.5" />}
              label="Orders"
            />

            <QuickAction
              href="/payments"
              icon={<CreditCard className="h-4.5 w-4.5" />}
              label="Payments"
            />

            {user ? (
              <>
                <div className="max-w-[140px] truncate text-sm font-medium text-slate-700 xl:max-w-[180px]">
                  {user.name}
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center rounded-full bg-slate-900 px-7 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center gap-2 rounded-full px-2 text-sm font-medium text-slate-700 transition hover:text-slate-950"
                >
                  <User className="h-4.5 w-4.5" />
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-7 text-sm font-semibold text-white transition hover:from-amber-600 hover:to-orange-600"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="hidden border-t border-slate-200 lg:block">
          <div className="mx-auto flex max-w-7xl items-center gap-10 px-4 sm:px-6 lg:px-8">
            <MainTab href="/products" label="Products" pathname={pathname} />
            <MainTab href="/vendors" label="Suppliers" pathname={pathname} />
            <MainTab href="/rfqs" label="RFQs" pathname={pathname} />
          </div>
        </div>
      </div>

      {/* ===================== MOBILE FULL PANEL ===================== */}
      {mobileOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close mobile menu overlay"
            onClick={closeMobileMenu}
            className="fixed inset-0 top-[116px] z-[68] bg-black/30"
          />

          <div className="fixed inset-x-0 top-[116px] z-[69] h-[calc(100dvh-116px)] overflow-y-auto bg-[#f6f7fb] shadow-2xl">
            <div className="min-h-full px-4 py-4">
              <div className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-base font-bold text-white shadow-sm">
                    GTH
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-slate-900">
                      GTH
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      Global Trade House
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-300 text-slate-700"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                action="/products"
                method="GET"
                className="mb-4 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm"
              >
                <div className="flex items-center gap-3 rounded-2xl px-3">
                  <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                  <input
                    name="q"
                    defaultValue={currentQuery}
                    aria-label="Search products"
                    placeholder="What are you looking for?"
                    className="h-11 w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <Camera className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                </div>
                <button
                  type="submit"
                  className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold text-white"
                >
                  Search
                </button>
              </form>

              <div className="mb-4 grid grid-cols-3 gap-3">
                <MobileShortcut
                  href="/categories"
                  icon={<LayoutGrid className="h-5 w-5" />}
                  label="Categories"
                  onClick={closeMobileMenu}
                />
                <MobileShortcut
                  href="/products"
                  icon={<PackageSearch className="h-5 w-5" />}
                  label="Products"
                  onClick={closeMobileMenu}
                />
                <MobileShortcut
                  href="/vendors"
                  icon={<Store className="h-5 w-5" />}
                  label="Suppliers"
                  onClick={closeMobileMenu}
                />
                <MobileShortcut
                  href="/orders"
                  icon={<ShoppingCart className="h-5 w-5" />}
                  label="Orders"
                  onClick={closeMobileMenu}
                />
                <MobileShortcut
                  href="/payments"
                  icon={<CreditCard className="h-5 w-5" />}
                  label="Payments"
                  onClick={closeMobileMenu}
                />
                <MobileShortcut
                  href="/rfqs"
                  icon={<ShieldCheck className="h-5 w-5" />}
                  label="RFQs"
                  onClick={closeMobileMenu}
                />
              </div>

              <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="grid gap-2">
                  <Link
                    href="/about"
                    onClick={closeMobileMenu}
                    className="rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Order Protection
                  </Link>
                  <Link
                    href="/support"
                    onClick={closeMobileMenu}
                    className="rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Help Center
                  </Link>
                  <Link
                    href="/contact"
                    onClick={closeMobileMenu}
                    className="rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Deliver to: ID
                  </Link>
                  <Link
                    href="/contact"
                    onClick={closeMobileMenu}
                    className="rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    English-IDR
                  </Link>
                  <Link
                    href="/dashboard/onboarding/vendor"
                    onClick={closeMobileMenu}
                    className="rounded-2xl px-3 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                  >
                    Become a Supplier
                  </Link>
                </div>
              </div>

              {user ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Signed in
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {user.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <form action={logout} className="mt-3">
                    <button
                      type="submit"
                      className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="grid gap-3">
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-300 text-base font-semibold text-slate-900"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMobileMenu}
                      className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-base font-semibold text-white"
                    >
                      Create account
                    </Link>
                  </div>
                </div>
              )}

              <div className="h-6" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}