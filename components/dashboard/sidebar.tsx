'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Users,
  Truck,
  Megaphone,
  Star,
  CreditCard,
  ShieldCheck,
  Store,
  Building2,
  HelpCircle,
  Tag,
  Boxes,
  Globe,
  PlusCircle,
  Briefcase,
  Sparkles,
  ChevronRight,
  UserCog,
  ClipboardList,
  Wallet,
  BadgeCheck,
  SearchCheck,
} from 'lucide-react'
import clsx from 'clsx'

type UserRole = 'buyer' | 'vendor' | 'admin'

type SidebarProps = {
  role?: UserRole
  onNavigate?: () => void
}

type MenuItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
  badge?: string
  description?: string
  exact?: boolean
}

type MenuGroup = {
  title: string
  items: MenuItem[]
}

const roleContent: Record<
  UserRole,
  {
    title: string
    description: string
    tone: string
  }
> = {
  buyer: {
    title: 'Buyer workspace',
    description:
      'Search suppliers, manage orders, send inquiries, review RFQs, and track payments in one place.',
    tone: 'from-emerald-50 to-teal-50 border-emerald-100 text-emerald-700',
  },
  vendor: {
    title: 'Supplier workspace',
    description:
      'Manage products, storefront, inquiries, orders, promotions, and marketplace growth from one control center.',
    tone: 'from-amber-50 to-orange-50 border-amber-100 text-amber-700',
  },
  admin: {
    title: 'Admin workspace',
    description:
      'Oversee marketplace users, categories, activity, buyer and supplier operations, and platform governance.',
    tone: 'from-purple-50 to-fuchsia-50 border-purple-100 text-purple-700',
  },
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['buyer', 'vendor', 'admin'],
        description: 'Role-based control center',
        exact: true,
      },
      {
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
        roles: ['vendor', 'admin'],
        description: 'Business insights and trends',
      },
    ],
  },
  {
    title: 'Business',
    items: [
      {
        label: 'Vendor Onboarding',
        href: '/dashboard/onboarding/vendor',
        icon: Briefcase,
        roles: ['buyer'],
        badge: 'Start',
        description: 'Upgrade to supplier access',
      },
      {
        label: 'Company Profile',
        href: '/dashboard/company',
        icon: Building2,
        roles: ['vendor'],
        description: 'Business identity and details',
      },
      {
        label: 'Storefront',
        href: '/dashboard/storefront',
        icon: Store,
        roles: ['vendor'],
        description: 'Public supplier presence',
      },
      {
        label: 'Products',
        href: '/dashboard/products',
        icon: Package,
        roles: ['vendor'],
        description: 'Catalog and product management',
      },
      {
        label: 'Add Product',
        href: '/dashboard/products/new',
        icon: PlusCircle,
        roles: ['vendor'],
        badge: 'New',
        description: 'Publish a new listing',
      },
      {
        label: 'Inventory',
        href: '/dashboard/inventory',
        icon: Boxes,
        roles: ['vendor'],
        description: 'Stock and availability',
      },
      {
        label: 'Categories',
        href: '/dashboard/categories',
        icon: Tag,
        roles: ['vendor', 'admin'],
        description: 'Catalog organization',
      },
    ],
  },
  {
    title: 'Trade Operations',
    items: [
      {
        label: 'Orders',
        href: '/dashboard/orders',
        icon: ShoppingCart,
        roles: ['buyer', 'vendor', 'admin'],
        description: 'Purchase and sales orders',
      },
      {
        label: 'Payments',
        href: '/dashboard/payments',
        icon: Wallet,
        roles: ['buyer', 'vendor', 'admin'],
        description: 'Payment activity and status',
      },
      {
        label: 'Shipping',
        href: '/dashboard/shipping',
        icon: Truck,
        roles: ['vendor'],
        description: 'Dispatch and delivery flow',
      },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        label: 'Inquiries',
        href: '/dashboard/inquiries',
        icon: MessageSquare,
        roles: ['buyer', 'vendor', 'admin'],
        description: 'Supplier and buyer conversations',
      },
      {
        label: 'Messages',
        href: '/dashboard/messages',
        icon: FileText,
        roles: ['buyer', 'vendor', 'admin'],
        description: 'Message threads and updates',
      },
      {
        label: 'RFQs',
        href: '/dashboard/rfqs',
        icon: ClipboardList,
        roles: ['buyer', 'vendor', 'admin'],
        description: 'Quotation requests and responses',
      },
      {
        label: 'Reviews',
        href: '/dashboard/reviews',
        icon: Star,
        roles: ['buyer', 'vendor', 'admin'],
        description: 'Ratings and feedback visibility',
      },
    ],
  },
  {
    title: 'Growth',
    items: [
      {
        label: 'Promotions',
        href: '/dashboard/promotions',
        icon: Megaphone,
        roles: ['vendor'],
        description: 'Campaigns and exposure',
      },
      {
        label: 'Performance',
        href: '/dashboard/performance',
        icon: Sparkles,
        roles: ['vendor'],
        description: 'Listing and sales performance',
      },
      {
        label: 'Certifications',
        href: '/dashboard/certifications',
        icon: BadgeCheck,
        roles: ['vendor'],
        description: 'Trust and verification assets',
      },
      {
        label: 'Marketing',
        href: '/dashboard/marketing',
        icon: SearchCheck,
        roles: ['vendor', 'admin'],
        description: 'Marketplace growth tools',
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        label: 'Users',
        href: '/dashboard/users',
        icon: UserCog,
        roles: ['buyer', 'vendor', 'admin'],
        description: 'Account and user management',
      },
      {
        label: 'Buyers',
        href: '/dashboard/buyers',
        icon: Users,
        roles: ['admin'],
        description: 'Buyer oversight',
      },
      {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        roles: ['buyer', 'vendor', 'admin'],
        description: 'Workspace preferences',
      },
      {
        label: 'Support',
        href: '/dashboard/support',
        icon: HelpCircle,
        roles: ['buyer', 'vendor', 'admin'],
        description: 'Help center and assistance',
      },
    ],
  },
]

function BrandBlock() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-base font-bold text-white shadow-sm">
        G
      </div>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-600">
          Global Trade House
        </p>
        <p className="truncate text-base font-bold tracking-tight text-slate-950">
          GTH Dashboard
        </p>
      </div>
    </Link>
  )
}

function isItemActive(
  pathname: string,
  href: string,
  exact?: boolean
) {
  if (exact) return pathname === href

  if (pathname === href) return true
  if (href === '/dashboard') return pathname === '/dashboard'

  return pathname.startsWith(`${href}/`)
}

export function Sidebar({ role = 'buyer', onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const workspace = roleContent[role]

  const visibleGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <BrandBlock />

        <div
          className={clsx(
            'mt-4 rounded-2xl border bg-gradient-to-r p-3',
            workspace.tone
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
            Current workspace
          </p>
          <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
            {workspace.title}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {workspace.description}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {visibleGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {group.title}
            </p>

            <div className="mt-2 space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isItemActive(pathname, item.href, item.exact)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={clsx(
                      'group block rounded-2xl px-3 py-2.5 transition-all duration-200',
                      active
                        ? 'bg-amber-50 text-amber-700 shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon
                          className={clsx(
                            'h-5 w-5 shrink-0',
                            active
                              ? 'text-amber-600'
                              : 'text-slate-500 group-hover:text-slate-700'
                          )}
                        />
                        <span className="truncate text-sm font-medium">
                          {item.label}
                        </span>
                      </span>

                      <span className="flex items-center gap-2">
                        {item.badge ? (
                          <span
                            className={clsx(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]',
                              active
                                ? 'bg-white text-amber-700'
                                : 'bg-slate-200 text-slate-600'
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}

                        <ChevronRight
                          className={clsx(
                            'h-4 w-4 shrink-0 transition-transform',
                            active
                              ? 'text-amber-600'
                              : 'text-slate-400 group-hover:translate-x-0.5'
                          )}
                        />
                      </span>
                    </div>

                    {item.description ? (
                      <p
                        className={clsx(
                          'mt-1.5 pl-8 pr-6 text-[11px] leading-5',
                          active ? 'text-amber-700/90' : 'text-slate-500'
                        )}
                      >
                        {item.description}
                      </p>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <Globe className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <p className="mt-3 px-3 text-xs text-slate-500">
          © {new Date().getFullYear()} GTH
        </p>
      </div>
    </aside>
  )
}