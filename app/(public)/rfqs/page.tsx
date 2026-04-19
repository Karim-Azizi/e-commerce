import Link from 'next/link'
import { createPublicClient, getPublicStorageUrl } from '@/lib/supabase/server'
import { FileText, Package, DollarSign, CalendarDays } from 'lucide-react'

function formatCurrency(amount: number | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount ?? 0)
}

export default async function PublicRFQsPage() {
  const supabase = await createPublicClient()

  const { data: rfqs, error } = await supabase
    .from('rfqs')
    .select('id, title, description, quantity, budget, status, created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 text-red-600">
        Failed to load RFQs.
      </main>
    )
  }

  return (
    <main className="bg-white text-slate-900">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">
            Global Trade House
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Open Requests for Quotation
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-200">
            Discover sourcing opportunities from buyers around the world and
            submit your quotations.
          </p>

          <div className="mt-6">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Join as a Supplier
            </Link>
          </div>
        </div>
      </section>

      {/* RFQ Listings */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {(rfqs || []).length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {rfqs!.map((rfq) => (
              <div
                key={rfq.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {rfq.title || 'Untitled RFQ'}
                    </h2>
                    <p className="mt-2 text-slate-600 line-clamp-2">
                      {rfq.description || 'No description provided.'}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 capitalize">
                    {rfq.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
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
                    Posted:{' '}
                    {rfq.created_at
                      ? new Date(rfq.created_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            <FileText className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 font-medium">No open RFQs found.</p>
          </div>
        )}
      </section>
    </main>
  )
}