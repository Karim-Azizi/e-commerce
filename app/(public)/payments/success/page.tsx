import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, CreditCard, Receipt, ShoppingBag } from 'lucide-react'
import { stripe } from '@/lib/stripe'
import { createPublicClient, getPublicStorageUrl } from '@/lib/supabase/server'

type PaymentRow = {
  id: string
  order_id: string | null
  amount: number | string | null
  status: string | null
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  if (!session_id) notFound()

  const session = await stripe.checkout.sessions.retrieve(session_id)

  const supabase = await createPublicClient()

  const { data: payment } = await supabase
    .from('payments')
    .select('id, order_id, amount, status')
    .eq('stripe_checkout_session_id', session_id)
    .maybeSingle()

  const paymentRow = payment as PaymentRow | null
  const amount = Number(paymentRow?.amount ?? 0)

  return (
    <main className="bg-transparent text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-8 py-10 text-white">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100">
                    Payment Complete
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight">
                    Thank you for your payment
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-emerald-50">
                    Your Stripe checkout completed successfully. Your order has
                    been recorded and your payment flow is now synchronized with
                    GTH.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:min-w-[320px]">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                    Payment Status
                  </p>
                  <p className="mt-2 text-lg font-bold capitalize">
                    {session.payment_status || 'unknown'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                    Amount
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    ${amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-amber-600" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Transaction Summary
                  </h2>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Checkout Session
                    </p>
                    <p className="mt-2 break-all text-sm font-medium text-slate-900">
                      {session.id}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Order Reference
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {paymentRow?.order_id
                        ? `#${paymentRow.order_id.slice(0, 8)}`
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Stripe Result
                    </p>
                    <p className="mt-2 text-sm font-medium capitalize text-slate-900">
                      {session.payment_status || 'unknown'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Stored Payment Status
                    </p>
                    <p className="mt-2 text-sm font-medium capitalize text-slate-900">
                      {paymentRow?.status || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-slate-900" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    What happens next
                  </h2>
                </div>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    Your order is now visible in your orders page.
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    Your payment record is available in your payments page.
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    You can continue sourcing products or review supplier
                    communication from your account.
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-amber-600" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Quick Actions
                  </h2>
                </div>

                <div className="mt-5 grid gap-3">
                  <Link
                    href="/orders"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View Orders
                  </Link>

                  <Link
                    href="/payments"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    View Payments
                  </Link>

                  <Link
                    href="/products"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                  GTH
                </p>
                <p className="mt-3 text-sm leading-7 text-amber-900">
                  Premium B2B sourcing, order tracking, and supplier engagement
                  in one professional buying flow.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}