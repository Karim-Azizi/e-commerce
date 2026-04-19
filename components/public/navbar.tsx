'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  ChevronDown,
  CreditCard,
  Globe,
  Headphones,
  LayoutGrid,
  MapPin,
  Menu,
  Package,
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
      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition hover:text-slate-950"
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

export function PublicNavbar({ user }: PublicNavbarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentQuery = useMemo(() => searchParams.get('q') || '', [searchParams])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      {/* ===================== TOP UTILITY BAR ===================== */}
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

      {/* ===================== MAIN HEADER ===================== */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5 sm:px-6 lg:gap-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-xl font-bold text-white shadow-sm">
            AP
          </div>

          <div className="min-w-0 leading-none">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-600">
              GTH
            </p>
            <p className="mt-1.5 text-[18px] font-bold tracking-[-0.02em] text-slate-950 sm:text-[20px]">
              Marketplace
            </p>
          </div>
        </Link>

        {/* Search */}
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

        {/* Desktop actions */}
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

        {/* Mobile button */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition hover:bg-slate-50 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* ===================== DESKTOP TABS ===================== */}
      <div className="hidden border-t border-slate-200 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-10 px-4 sm:px-6 lg:px-8">
          <MainTab href="/products" label="Products" pathname={pathname} />
          <MainTab href="/vendors" label="Suppliers" pathname={pathname} />
          <MainTab href="/rfqs" label="RFQs" pathname={pathname} />
        </div>
      </div>

      {/* ===================== MOBILE PANEL ===================== */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] bg-black/40 lg:hidden">
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">GTH</p>
                <p className="text-xs text-slate-500">Marketplace Menu</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700"
                aria-label="Close menu"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-6 px-5 py-5">
              {/* Mobile search */}
              <form
                action="/products"
                method="GET"
                className="rounded-2xl border border-slate-300 bg-white p-2 shadow-sm"
              >
                <div className="flex items-center gap-3 rounded-xl px-3">
                  <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                  <input
                    name="q"
                    defaultValue={currentQuery}
                    aria-label="Search products"
                    placeholder="What are you looking for?"
                    className="h-11 w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold text-white"
                >
                  Search
                </button>
              </form>

              {/* Utility links */}
              <div className="grid gap-2">
                <Link href="/categories" className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  All Categories
                </Link>
                <Link href="/products" className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Products
                </Link>
                <Link href="/vendors" className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Suppliers
                </Link>
                <Link href="/rfqs" className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  RFQs
                </Link>
                <Link href="/orders" className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Orders
                </Link>
                <Link href="/payments" className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Payments
                </Link>
                <Link href="/about" className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Order Protection
                </Link>
                <Link href="/support" className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Help Center
                </Link>
                <Link
                  href="/dashboard/onboarding/vendor"
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                >
                  Become a Supplier
                </Link>
              </div>

              {/* Auth */}
              {user ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Signed in
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {user.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                  </div>

                  <form action={logout}>
                    <button
                      type="submit"
                      className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 text-sm font-semibold text-slate-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold text-white"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}