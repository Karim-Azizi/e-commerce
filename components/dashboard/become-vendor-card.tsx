import Link from 'next/link'

export function BecomeVendorCard() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <h2 className="text-xl font-semibold text-amber-800">
        Become a Vendor
      </h2>
      <p className="mt-2 text-sm text-amber-700">
        Start selling your products and reach global buyers by creating your
        company profile.
      </p>
      <Link
        href="/dashboard/onboarding/vendor"
        className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 text-white font-semibold hover:bg-amber-700"
      >
        Start Onboarding
      </Link>
    </div>
  )
}