import Link from 'next/link'

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>
}) {
  const { order_id } = await searchParams

  return (
    <main className="bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
            Payment Cancelled
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Your payment was not completed
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-700">
            You can return to your order and try the payment again.
          </p>

          {order_id ? (
            <p className="mt-3 text-sm text-slate-600">
              Order reference:{' '}
              <span className="font-medium">#{order_id.slice(0, 8)}</span>
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/orders"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              View Orders
            </Link>

            <Link
              href="/payments"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              View Payments
            </Link>

            <Link
              href="/products"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}