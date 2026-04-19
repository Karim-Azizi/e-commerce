import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createVendor } from '@/app/auth/actions'

export default async function VendorOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams
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

  if (profile?.role === 'vendor') {
    redirect('/dashboard')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
          Vendor Onboarding
        </p>
        <h1 className="mt-2 text-3xl font-bold">Become a Vendor</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create your supplier profile to start selling on the platform.
        </p>

        {message ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        ) : null}

        <form action={createVendor} className="mt-6 space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              Company Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="slug" className="mb-2 block text-sm font-medium text-slate-700">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="country" className="mb-2 block text-sm font-medium text-slate-700">
              Country
            </label>
            <input
              id="country"
              name="country"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
          >
            Create Vendor Profile
          </button>
        </form>
      </div>
    </div>
  )
}