import Link from 'next/link'
import type { ReactNode } from 'react'
import { Globe, Landmark, ShieldCheck, Truck, Users, Store, BadgeCheck } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f3f3f3] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff6a00] text-lg font-bold text-white shadow-sm">
              G
            </div>
            <div className="leading-none">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff6a00]">
                Global Trade House
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                GTH
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700"
          >
            <Globe className="h-4 w-4" />
            English
          </button>
        </div>
      </div>

      <section className="mx-auto grid min-h-[calc(100vh-84px)] max-w-[1440px] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="hidden bg-gradient-to-b from-[#ff6a00] via-[#ff8a2a] to-[#f7e8dd] p-10 lg:flex">
          <div className="flex w-full flex-col rounded-[28px] bg-gradient-to-b from-[#ff6a00] via-[#f79345] to-[#f5ece5] px-10 py-12 text-white">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-[15px] font-semibold tracking-tight text-white/95">
                Global B2B sourcing with
              </p>
              <h1 className="mt-2 text-5xl font-bold leading-tight tracking-tight">
                supplier trust and smarter trade
              </h1>
              <p className="mt-5 text-base leading-8 text-white/90">
                Join GTH to discover suppliers, source products, manage orders,
                and grow your international business in one professional marketplace.
              </p>
            </div>

            <div className="relative mt-16 flex flex-1 items-end justify-center">
              <div className="absolute inset-x-10 bottom-0 h-14 rounded-full bg-white/25 blur-2xl" />

              <div className="relative flex items-end gap-6">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/90 text-[#ff6a00] shadow-xl">
                  <Truck className="h-10 w-10" />
                </div>

                <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-[6px] border-[#f5d7c5] bg-white/80 shadow-2xl">
                  <div className="absolute inset-6 rounded-full border-2 border-[#f0c8af]" />
                  <div className="absolute left-4 right-4 top-1/2 h-[2px] -translate-y-1/2 bg-[#f0c8af]" />
                  <div className="absolute bottom-4 top-4 left-1/2 w-[2px] -translate-x-1/2 bg-[#f0c8af]" />
                  <div className="absolute -left-3 top-1/2 h-3 w-[calc(100%+24px)] -translate-y-1/2 rotate-[24deg] rounded-full border-4 border-[#ff6a00]" />
                  <Landmark className="h-16 w-16 text-[#ff6a00]" />
                </div>

                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[26px] bg-[#ff8d2c] text-white shadow-xl">
                  <ShieldCheck className="h-10 w-10" />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <Store className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                    Suppliers
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  Publish products and manage trade operations
                </p>
              </div>

              <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                    Buyers
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  Search products, contact suppliers, and place orders
                </p>
              </div>

              <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <BadgeCheck className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                    Secure access
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  One account system with role-based workspace access
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <div className="w-full max-w-[430px]">{children}</div>
        </div>
      </section>
    </div>
  )
}