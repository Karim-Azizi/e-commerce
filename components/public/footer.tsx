'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Globe,
  ShieldCheck,
  LayoutDashboard,
  Building2,
  CreditCard,
  Truck,
  Headphones,
  ChevronDown,
} from 'lucide-react'

type PublicFooterProps = {
  user?: {
    name: string
    email: string
    role: string
  } | null
}

const footerColumns = [
  {
    title: 'Get support',
    links: [
      { label: 'Help Center', href: '/support' },
      { label: 'Live chat', href: '/contact' },
      { label: 'Check order status', href: '/orders' },
      { label: 'Refunds', href: '/payments' },
      { label: 'Report abuse', href: '/support' },
    ],
  },
  {
    title: 'Payments and protections',
    links: [
      { label: 'Safe and easy payments', href: '/payments' },
      { label: 'Money-back policy', href: '/about' },
      { label: 'On-time shipping', href: '/orders' },
      { label: 'After-sales protections', href: '/support' },
      { label: 'Product monitoring services', href: '/about' },
    ],
  },
  {
    title: 'Source on GTH',
    links: [
      { label: 'Request for Quotation', href: '/rfqs' },
      { label: 'Membership program', href: '/signup' },
      { label: 'Sales tax and VAT', href: '/about' },
      { label: 'Marketplace insights', href: '/about' },
    ],
  },
  {
    title: 'Sell on GTH',
    links: [
      { label: 'Start selling', href: '/dashboard/onboarding/vendor' },
      { label: 'Seller Central', href: '/dashboard' },
      { label: 'Become a Verified Supplier', href: '/dashboard/onboarding/vendor' },
      { label: 'Partnerships', href: '/contact' },
      { label: 'Download the app for suppliers', href: '/about' },
    ],
  },
  {
    title: 'Get to know us',
    links: [
      { label: 'About GTH', href: '/about' },
      { label: 'Corporate responsibility', href: '/about' },
      { label: 'News center', href: '/about' },
      { label: 'Careers', href: '/about' },
    ],
  },
]

const socialIcons = [
  { name: 'Facebook', href: 'https://facebook.com', src: 'https://cdn.simpleicons.org/facebook/1877F2' },
  { name: 'Instagram', href: 'https://instagram.com', src: 'https://cdn.simpleicons.org/instagram/E4405F' },
  { name: 'YouTube', href: 'https://youtube.com', src: 'https://cdn.simpleicons.org/youtube/FF0000' },
  { name: 'WhatsApp', href: 'https://wa.me/', src: 'https://cdn.simpleicons.org/whatsapp/25D366' },
]

const paymentIcons = [
  { name: 'Stripe', src: 'https://cdn.simpleicons.org/stripe/635BFF' },
  { name: 'Visa', src: 'https://cdn.simpleicons.org/visa/1A1F71' },
  { name: 'Mastercard', src: 'https://cdn.simpleicons.org/mastercard/EB001B' },
  { name: 'American Express', src: 'https://cdn.simpleicons.org/americanexpress/2E77BC' },
  { name: 'PayPal', src: 'https://cdn.simpleicons.org/paypal/003087' },
  { name: 'Apple Pay', src: 'https://cdn.simpleicons.org/applepay/000000' },
  { name: 'Google Pay', src: 'https://cdn.simpleicons.org/googlepay/4285F4' },

  {
    name: 'GoPay',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Gopay%20logo.svg',
  },
  {
    name: 'DANA',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Logo%20dana%20blue.svg',
  },
  {
    name: 'OVO',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Logo%20ovo%20purple.svg',
  },
  {
    name: 'LinkAja',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/File:LinkAja.svg',
  },

  { name: 'M-Paisa', src: 'https://cdn.simpleicons.org/paypal/16A34A' },
  { name: 'Roshan Pay', src: 'https://cdn.simpleicons.org/paypal/F97316' },
  { name: 'Etisalat Cash', src: 'https://cdn.simpleicons.org/paypal/059669' },
]

function BrandIcon({
  src,
  alt,
  size = 20,
  className = '',
}: {
  src: string
  alt: string
  size?: number
  className?: string
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className={className}
      referrerPolicy="no-referrer"
    />
  )
}

function MobileAccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
      >
        <span className="text-sm font-semibold tracking-[-0.01em] text-slate-900">
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? <div className="border-t border-slate-100 px-4 pb-4 pt-3">{children}</div> : null}
    </div>
  )
}

export function PublicFooter({ user }: PublicFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-10 border-t border-slate-200 bg-[#f5f5f7] text-slate-700">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
        {/* ===================== MOBILE / TABLET ===================== */}
        <div className="xl:hidden space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/orders"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">Track orders</p>
              <p className="mt-1 text-xs text-slate-500">Check delivery and shipping progress</p>
            </Link>

            <Link
              href="/payments"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">Payment center</p>
              <p className="mt-1 text-xs text-slate-500">Secure checkout and payment history</p>
            </Link>

            <Link
              href="/vendors"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">Find suppliers</p>
              <p className="mt-1 text-xs text-slate-500">Browse trusted and verified partners</p>
            </Link>

            <Link
              href="/dashboard"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">Workspace</p>
              <p className="mt-1 text-xs text-slate-500">Access your dashboard and business tools</p>
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold tracking-[-0.01em] text-slate-900">
              Payments and checkout
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {paymentIcons.map((payment) => (
                <div
                  key={payment.name}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">
                    <BrandIcon
                      src={payment.src}
                      alt={payment.name}
                      size={18}
                      className="max-h-[18px] max-w-[18px] object-contain"
                    />
                  </div>
                  <span className="truncate text-xs font-medium text-slate-700">
                    {payment.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Secure checkout
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-amber-600" />
                On-time shipping
              </span>
              <span className="flex items-center gap-1.5">
                <Headphones className="h-4 w-4 text-indigo-600" />
                24/7 support
              </span>
            </div>
          </div>

          <MobileAccordionSection title="Get support" defaultOpen>
            <div className="grid gap-3">
              {footerColumns[0].links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-600 transition hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </MobileAccordionSection>

          <MobileAccordionSection title="Payments and protections">
            <div className="grid gap-3">
              {footerColumns[1].links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-600 transition hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </MobileAccordionSection>

          <MobileAccordionSection title="Source on GTH">
            <div className="grid gap-3">
              {footerColumns[2].links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-600 transition hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </MobileAccordionSection>

          <MobileAccordionSection title="Sell on GTH">
            <div className="grid gap-3">
              {footerColumns[3].links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-600 transition hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </MobileAccordionSection>

          <MobileAccordionSection title="Get to know us">
            <div className="grid gap-3">
              {footerColumns[4].links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-600 transition hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-2">
                <h4 className="text-sm font-semibold text-slate-900">Stay connected</h4>
                <div className="mt-3 flex flex-wrap gap-3">
                  {socialIcons.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <BrandIcon
                        src={social.src}
                        alt={social.name}
                        size={16}
                        className="h-4 w-4 object-contain"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </MobileAccordionSection>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/orders"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-800 transition hover:bg-white"
              >
                <span>Track orders</span>
                <LayoutDashboard className="h-5 w-5 text-slate-400" />
              </Link>
              <Link
                href="/payments"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-800 transition hover:bg-white"
              >
                <span>Payment center</span>
                <CreditCard className="h-5 w-5 text-slate-400" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-800 transition hover:bg-white"
              >
                <span>Dashboard</span>
                <LayoutDashboard className="h-5 w-5 text-slate-400" />
              </Link>
              <Link
                href="/vendors"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-800 transition hover:bg-white"
              >
                <span>Find suppliers</span>
                <Building2 className="h-5 w-5 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white px-4 py-5 text-center shadow-sm">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-slate-500">
              <Link href="/products" className="transition hover:text-slate-900">Products</Link>
              <span>·</span>
              <Link href="/vendors" className="transition hover:text-slate-900">Suppliers</Link>
              <span>·</span>
              <Link href="/rfqs" className="transition hover:text-slate-900">RFQs</Link>
              <span>·</span>
              <Link href="/orders" className="transition hover:text-slate-900">Orders</Link>
              <span>·</span>
              <Link href="/payments" className="transition hover:text-slate-900">Payments</Link>
              <span>·</span>
              <Link href="/dashboard" className="transition hover:text-slate-900">Dashboard</Link>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-slate-500">
              <Link href="/about" className="transition hover:text-slate-900">About</Link>
              <span>·</span>
              <Link href="/contact" className="transition hover:text-slate-900">Contact</Link>
              <span>·</span>
              <Link href="/support" className="transition hover:text-slate-900">Help Center</Link>
              <span>·</span>
              <Link href={user ? '/payments' : '/login'} className="transition hover:text-slate-900">
                {user ? 'Account' : 'Sign in'}
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              © {year} GTH. All rights reserved.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Global B2B marketplace
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Trusted suppliers
              </span>
              <span className="flex items-center gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Integrated buyer dashboard
              </span>
            </div>
          </div>
        </div>

        {/* ===================== DESKTOP ===================== */}
        <div className="hidden xl:block">
          <div className="rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
            <div className="px-6 py-10 sm:px-8 lg:px-10">
              <div className="grid grid-cols-2 gap-x-10 gap-y-10 md:grid-cols-3 xl:grid-cols-5">
                {footerColumns.map((column, columnIndex) => (
                  <div key={`${column.title}-${columnIndex}`}>
                    <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
                      {column.title}
                    </h3>

                    <ul className="mt-5 space-y-4">
                      {column.links.map((link, linkIndex) => (
                        <li key={`${column.title}-${link.label}-${linkIndex}`}>
                          <Link
                            href={link.href}
                            className="text-[15px] leading-7 text-slate-600 transition hover:text-slate-950"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {column.title === 'Get to know us' && (
                      <div className="mt-8">
                        <h4 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
                          Stay connected
                        </h4>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {socialIcons.map((social) => (
                            <a
                              key={social.name}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={social.name}
                              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <BrandIcon
                                src={social.src}
                                alt={social.name}
                                size={18}
                                className="h-[18px] w-[18px] object-contain"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-8 sm:px-8 lg:px-10">
              <h3 className="mb-4 flex items-center gap-2 text-[16px] font-semibold tracking-[-0.01em] text-slate-900">
                <CreditCard className="h-4 w-4" />
                Payments and checkout
              </h3>

              <div className="flex flex-wrap gap-4">
                {paymentIcons.map((payment) => (
                  <div
                    key={payment.name}
                    className="flex h-[76px] min-w-[150px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
                      <BrandIcon
                        src={payment.src}
                        alt={payment.name}
                        size={22}
                        className="max-h-[22px] max-w-[22px] object-contain"
                      />
                    </div>
                    <span className="text-[15px] font-medium tracking-[-0.01em] text-slate-700">
                      {payment.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-6 text-[14px] text-slate-600">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Secure checkout
                </span>
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-amber-600" />
                  On-time shipping
                </span>
                <span className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-indigo-600" />
                  24/7 support
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-8 sm:px-8 lg:px-10">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Buyer tools
                  </p>
                  <div className="space-y-4">
                    <Link
                      href="/orders"
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[16px] font-medium text-slate-800 transition hover:bg-slate-50"
                    >
                      <span>Track orders</span>
                      <LayoutDashboard className="h-5 w-5 text-slate-400" />
                    </Link>
                    <Link
                      href="/payments"
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[16px] font-medium text-slate-800 transition hover:bg-slate-50"
                    >
                      <span>Payment center</span>
                      <CreditCard className="h-5 w-5 text-slate-400" />
                    </Link>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Business workspace
                  </p>
                  <div className="space-y-4">
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[16px] font-medium text-slate-800 transition hover:bg-slate-50"
                    >
                      <span>Dashboard</span>
                      <LayoutDashboard className="h-5 w-5 text-slate-400" />
                    </Link>
                    <Link
                      href="/vendors"
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[16px] font-medium text-slate-800 transition hover:bg-slate-50"
                    >
                      <span>Find suppliers</span>
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-8 sm:px-8 lg:px-10">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[14px] text-slate-500">
                <Link href="/products" className="transition hover:text-slate-900">Products</Link>
                <span>·</span>
                <Link href="/vendors" className="transition hover:text-slate-900">Suppliers</Link>
                <span>·</span>
                <Link href="/rfqs" className="transition hover:text-slate-900">RFQs</Link>
                <span>·</span>
                <Link href="/orders" className="transition hover:text-slate-900">Orders</Link>
                <span>·</span>
                <Link href="/payments" className="transition hover:text-slate-900">Payments</Link>
                <span>·</span>
                <Link href="/dashboard" className="transition hover:text-slate-900">Dashboard</Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[14px] text-slate-500">
                <Link href="/about" className="transition hover:text-slate-900">About</Link>
                <span>·</span>
                <Link href="/contact" className="transition hover:text-slate-900">Contact</Link>
                <span>·</span>
                <Link href="/support" className="transition hover:text-slate-900">Help Center</Link>
                <span>·</span>
                <Link href={user ? '/payments' : '/login'} className="transition hover:text-slate-900">
                  {user ? 'Account' : 'Sign in'}
                </Link>
              </div>

              <p className="mt-5 text-center text-[13px] text-slate-500">
                © {year} GTH. All rights reserved.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-[13px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Global B2B marketplace
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Trusted suppliers
                </span>
                <span className="flex items-center gap-1.5">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Integrated buyer dashboard
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}