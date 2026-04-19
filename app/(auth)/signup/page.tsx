import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import {
  ArrowRight,
  Mail,
  QrCode,
  User,
  ShoppingBag,
  Briefcase,
  CheckCircle2,
} from 'lucide-react'

type SearchParams = Promise<{
  message?: string
  redirect_to?: string
}>

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.46a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.55-5.17 3.55-8.68Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.46 1.14-4.07 1.14-3.12 0-5.77-2.11-6.71-4.95H1.28v3.12A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.27A7.22 7.22 0 0 1 4.91 12c0-.79.14-1.55.38-2.27V6.61H1.28A12 12 0 0 0 0 12c0 1.93.46 3.75 1.28 5.39l4.01-3.12Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.2 15.23 0 12 0A12 12 0 0 0 1.28 6.61l4.01 3.12c.94-2.84 3.59-4.96 6.71-4.96Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.39H7.08V12h3.04V9.36c0-3 1.79-4.66 4.53-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.96.93-1.96 1.88V12h3.33l-.53 3.46h-2.8v8.39A12 12 0 0 0 24 12Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#0A66C2" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.03-1.85-3.03-1.85 0-2.13 1.44-2.13 2.94v5.66H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.11 2.06 2.06 0 0 1 0 4.11ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  )
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const resolvedSearchParams = await searchParams
  const message = resolvedSearchParams?.message
  const redirectTo = resolvedSearchParams?.redirect_to || '/dashboard'
  const isSuccessMessage =
    !!message && /success|created|welcome|signed|account/i.test(message)

  return (
    <div>
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-slate-950">
          Sign in or create account
        </h1>
      </div>

      {message ? (
        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
            isSuccessMessage
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <label className="group cursor-pointer rounded-2xl border border-slate-300 bg-white p-4 transition hover:border-[#ff6a00]">
          <input
            type="radio"
            name="role"
            value="buyer"
            defaultChecked
            className="sr-only"
            form="signup-form"
          />
          <div className="flex items-center gap-2 text-slate-700">
            <ShoppingBag className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Join as buyer
            </p>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            Search products, send inquiries, and place orders
          </p>
        </label>

        <label className="group cursor-pointer rounded-2xl border border-slate-300 bg-white p-4 transition hover:border-[#ff6a00]">
          <input
            type="radio"
            name="role"
            value="supplier"
            className="sr-only"
            form="signup-form"
          />
          <div className="flex items-center gap-2 text-slate-700">
            <Briefcase className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Join as supplier
            </p>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            List products and manage your business workspace
          </p>
        </label>
      </div>

      <div className="mt-8 space-y-4">
        <button
          type="button"
          disabled
          className="flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-400 bg-white px-4 text-lg font-semibold text-slate-900"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <button
          type="button"
          disabled
          className="flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-400 bg-white px-4 text-lg font-semibold text-slate-900"
        >
          <FacebookIcon />
          Continue with Facebook
        </button>

        <button
          type="button"
          disabled
          className="flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-400 bg-white px-4 text-lg font-semibold text-slate-900"
        >
          <LinkedInIcon />
          Continue with LinkedIn
        </button>
      </div>

      <div className="mt-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm font-medium text-slate-500">OR</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={signup} id="signup-form" className="mt-7 space-y-4">
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <div className="relative">
          <label htmlFor="full_name" className="sr-only">
            Full name
          </label>
          <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="full_name"
            type="text"
            name="full_name"
            required
            autoComplete="name"
            placeholder="Full name"
            className="h-[58px] w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
          />
        </div>

        <div className="relative">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="Enter your email address"
            className="h-[58px] w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
          />
        </div>

        <input
          id="password"
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Create password"
          className="h-[58px] w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
        />

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#e85b00]" />
            <p className="text-xs leading-6 text-slate-600">
              Your selected role will be used to prepare your GTH workspace after
              account creation. If you came from product checkout, you will return
              to payment after login.
            </p>
          </div>
        </div>

        <p className="text-xs leading-6 text-slate-500">
          By creating an account, you agree to the GTH Terms of Use and Privacy Policy.
        </p>

        <button
          type="submit"
          className="inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#e85b00] px-5 text-lg font-semibold text-white transition hover:bg-[#d95200]"
        >
          Continue
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>

      <p className="mt-7 text-center text-base text-slate-600">
        Already have a GTH account?{' '}
        <Link
          href={`/login?redirect_to=${encodeURIComponent(redirectTo)}`}
          className="font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-700"
        >
          Sign in
        </Link>
      </p>

      <div className="mt-14 flex items-center justify-end gap-2 text-sm text-slate-500">
        <QrCode className="h-4 w-4" />
        Sign in with QR code
      </div>
    </div>
  )
}