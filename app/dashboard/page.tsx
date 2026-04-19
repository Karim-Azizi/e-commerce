import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Package,
  ShoppingCart,
  MessageSquare,
  FileText,
  UserCheck,
  ArrowRight,
  Store,
  TrendingUp,
  ShieldCheck,
  Building2,
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type Role = 'buyer' | 'vendor' | 'admin'

type OrderRow = {
  id: string
  status: string | null
  total_amount: number | string | null
  created_at: string | null
}

type InquiryRow = {
  id: string
  message: string | null
  status: string | null
  created_at: string | null
}

type StatCard = {
  label: string
  value: number
  href: string
  visible: boolean
  icon: React.ComponentType<{ className?: string }>
  color: string
  helper: string
}

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

function resolveUserName(user: any, profile: any) {
  return (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0]?.replace(/[._-]/g, ' ') ||
    'User'
  )
}

/* -------------------------------------------------------------------------- */
/*                                Main Component                              */
/* -------------------------------------------------------------------------- */

export default async function DashboardPage() {
  const supabase = await createClient()

  /* ----------------------------- AUTHENTICATION ---------------------------- */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  /* ----------------------------- USER PROFILE ------------------------------ */
  let { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  // Auto-create profile if it doesn't exist
  if (!profile) {
    const { data: insertedProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        role: 'buyer',
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0],
      })
      .select()
      .single()

    profile = insertedProfile
  }

  const role: Role =
    profile?.role === 'vendor' || profile?.role === 'admin'
      ? profile.role
      : 'buyer'

  const userName = resolveUserName(user, profile)

  /* ----------------------------- VENDOR DATA ------------------------------- */
  let vendorId: string | null = null
  let vendorCompanyName: string | null = null

  if (role === 'vendor') {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, company_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!vendor) {
      redirect('/dashboard/onboarding/vendor')
    }

    vendorId = vendor?.id || null
    vendorCompanyName = vendor?.company_name || null
  }

  /* ----------------------------- STATISTICS -------------------------------- */
  const [
    { count: productsCount },
    { count: ordersCount },
    { count: inquiriesCount },
    { count: rfqsCount },
  ] = await Promise.all([
    role === 'vendor' && vendorId
      ? supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendorId)
      : role === 'admin'
      ? supabase.from('products').select('*', { count: 'exact', head: true })
      : Promise.resolve({ count: 0 }),

    role === 'vendor' && vendorId
      ? supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendorId)
      : role === 'buyer'
      ? supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)
      : supabase.from('orders').select('*', { count: 'exact', head: true }),

    role === 'vendor' && vendorId
      ? supabase
          .from('inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendorId)
      : role === 'buyer'
      ? supabase
          .from('inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)
      : supabase.from('inquiries').select('*', { count: 'exact', head: true }),

    role === 'buyer'
      ? supabase
          .from('rfqs')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)
      : supabase.from('rfqs').select('*', { count: 'exact', head: true }),
  ])

  /* ----------------------------- RECENT DATA ------------------------------- */
  const ordersQuery =
    role === 'vendor' && vendorId
      ? supabase
          .from('orders')
          .select('id, status, total_amount, created_at')
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false })
          .limit(5)
      : role === 'buyer'
      ? supabase
          .from('orders')
          .select('id, status, total_amount, created_at')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      : supabase
          .from('orders')
          .select('id, status, total_amount, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

  const inquiriesQuery =
    role === 'vendor' && vendorId
      ? supabase
          .from('inquiries')
          .select('id, message, status, created_at')
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false })
          .limit(5)
      : role === 'buyer'
      ? supabase
          .from('inquiries')
          .select('id, message, status, created_at')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      : supabase
          .from('inquiries')
          .select('id, message, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

  const [{ data: recentOrders }, { data: recentInquiries }] =
    await Promise.all([ordersQuery, inquiriesQuery])

  /* ----------------------------- STAT CARDS -------------------------------- */
  const stats: StatCard[] = [
    {
      label: 'Products',
      value: productsCount ?? 0,
      href: '/dashboard/products',
      visible: role !== 'buyer',
      icon: Package,
      color: 'bg-amber-50 text-amber-600',
      helper:
        role === 'admin'
          ? 'Marketplace catalog'
          : 'Your active product listings',
    },
    {
      label: 'Orders',
      value: ordersCount ?? 0,
      href: '/dashboard/orders',
      visible: true,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
      helper:
        role === 'buyer'
          ? 'Your purchasing orders'
          : 'Manage incoming and outgoing orders',
    },
    {
      label: 'Inquiries',
      value: inquiriesCount ?? 0,
      href: '/dashboard/inquiries',
      visible: true,
      icon: MessageSquare,
      color: 'bg-emerald-50 text-emerald-600',
      helper:
        role === 'buyer'
          ? 'Messages sent to suppliers'
          : 'Buyer communication pipeline',
    },
    {
      label: 'RFQs',
      value: rfqsCount ?? 0,
      href: '/dashboard/rfqs',
      visible: role === 'buyer' || role === 'admin',
      icon: FileText,
      color: 'bg-purple-50 text-purple-600',
      helper:
        role === 'buyer'
          ? 'Your quotation requests'
          : 'Open marketplace RFQs',
    },
  ]

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Hero Section                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">
              GTH Control Center
            </p>
            <h1 className="mt-2 break-words text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {userName}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
              {role === 'vendor'
                ? `Manage your supplier operations, track product performance, review buyer inquiries, and grow ${
                    vendorCompanyName || 'your company'
                  } from one unified workspace.`
                : role === 'admin'
                ? 'Monitor marketplace activity, manage suppliers and buyers, and oversee the entire GTH ecosystem.'
                : 'Track orders, communicate with suppliers, manage RFQs, and streamline your sourcing journey.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={
                role === 'vendor' || role === 'admin'
                  ? '/dashboard/products/new'
                  : '/dashboard/onboarding/vendor'
              }
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {role === 'vendor' || role === 'admin'
                ? 'Add New Product'
                : 'Become a Supplier'}
            </Link>

            <Link
              href="/dashboard/inquiries"
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open Inquiries
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Statistics                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats
          .filter((stat) => stat.visible)
          .map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {stat.helper}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 flex items-center text-sm font-semibold text-amber-600">
                  View details
                  <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            )
          })}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Workspace Summary                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Workspace Summary
        </h2>

        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-amber-600">
          <ShieldCheck className="h-4 w-4" />
          Secure and verified environment
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          <span className="font-semibold capitalize text-slate-900">
            Current role: {role}
          </span>
          {' — '}
          {role === 'buyer'
            ? 'Manage sourcing activities and supplier communication.'
            : role === 'vendor'
            ? 'Manage products, storefront, and buyer relationships.'
            : 'Oversee the entire marketplace and platform governance.'}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Workspace
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Store className="h-4 w-4 text-amber-600" />
              GTH Dashboard
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Status
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Live marketplace activity
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}