import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  FileText,
  PlusCircle,
  Package,
  DollarSign,
  CalendarDays,
} from 'lucide-react'

function getStatusClasses(status: string | null) {
  switch (status) {
    case 'closed':
      return 'bg-slate-100 text-slate-700'
    case 'awarded':
      return 'bg-emerald-100 text-emerald-700'
    case 'pending':
      return 'bg-amber-100 text-amber-700'
    case 'open':
    default:
      return 'bg-blue-100 text-blue-700'
  }
}

function formatCurrency(amount: number | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount ?? 0)
}

export default async function RFQsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || 'buyer'

  const { data: rfqs, error } =
    role === 'buyer'
      ? await supabase
          .from('rfqs')
          .select('id, title, description, quantity, budget, status, created_at')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
      : await supabase
          .from('rfqs')
          .select('id, title, description, quantity, budget, status, created_at')
          .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load RFQs: {error.message}
      </div>
    )
  }

  const totalRFQs = rfqs?.length || 0
  const openRFQs = rfqs?.filter((r) => r.status === 'open').length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Request for Quotations (RFQs)
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {role === 'buyer'
              ? 'Manage your quotation requests and track supplier responses.'
              : 'Explore open RFQs from global buyers and submit your quotations.'}
          </p>
        </div>

        {role === 'buyer' && (
          <Link
            href="/dashboard/rfqs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600"
          >
            <PlusCircle className="h-4 w-4" />
            Create RFQ
          </Link>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total RFQs</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalRFQs}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open RFQs</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {openRFQs}
          </p>
        </div>
      </div>

      {/* RFQ List */}
      <div className="space-y-4">
        {rfqs?.length ? (
          rfqs.map((rfq) => (
            <div
              key={rfq.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {rfq.title || 'Untitled RFQ'}
                  </h2>
                  <p className="text-slate-600 line-clamp-2">
                    {rfq.description || 'No description provided.'}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                    rfq.status
                  )}`}
                >
                  {rfq.status || 'open'}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Quantity: {rfq.quantity ?? 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Budget: {formatCurrency(Number(rfq.budget))}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {rfq.created_at
                    ? new Date(rfq.created_at).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            <FileText className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 font-medium">No RFQs found.</p>
          </div>
        )}
      </div>
    </div>
  )
}