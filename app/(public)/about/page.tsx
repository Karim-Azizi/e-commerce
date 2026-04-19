// app/(public)/about/page.tsx
import Link from 'next/link'
import {
  Globe,
  ShieldCheck,
  Users,
  Package,
  MessageSquareQuote,
  TrendingUp,
  Building2,
  Handshake,
} from 'lucide-react'

export const metadata = {
  title: 'About GTH – Global Trade House',
  description:
    'Learn about GTH – Global Trade House, a premium B2B marketplace connecting global buyers and suppliers through secure and scalable trade solutions.',
}

export default function AboutPage() {
  return (
    <main className="bg-white text-slate-900">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.15),_transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            About GTH
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Global Trade House
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            <span className="font-semibold text-slate-900">
              GTH – Global Trade House
            </span>{' '}
            is a modern B2B marketplace inspired by global leaders like
            Alibaba.com. Our platform connects verified suppliers and buyers,
            enabling secure, efficient, and scalable international trade across
            industries.
          </p>

          {/* Call to Action */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
            >
              Explore Products
            </Link>
            <Link
              href="/dashboard/onboarding/vendor"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Become a Supplier
            </Link>
          </div>
        </div>
      </section>

      {/* ================= MISSION & VISION ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-amber-600">
              <Globe className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Our Mission</h2>
            </div>
            <p className="mt-4 text-slate-600 leading-7">
              Our mission is to simplify global trade by providing a trusted
              digital ecosystem where businesses can discover suppliers,
              showcase products, and establish long-term partnerships. We aim
              to empower companies of all sizes to participate in international
              commerce with confidence.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-amber-600">
              <TrendingUp className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Our Vision</h2>
            </div>
            <p className="mt-4 text-slate-600 leading-7">
              GTH envisions becoming a leading B2B marketplace in emerging
              markets such as Indonesia and Afghanistan, fostering economic
              growth and global collaboration through innovation, trust, and
              technology.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CORE FEATURES ================= */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
              Why Choose GTH
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Powerful Features for Global Trade
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              Inspired by the best practices of Alibaba.com, GTH offers a
              comprehensive suite of tools designed to streamline B2B commerce.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: 'Verified Suppliers',
                description:
                  'Connect with trusted and verified suppliers to ensure safe and reliable transactions.',
              },
              {
                icon: Package,
                title: 'Extensive Product Catalog',
                description:
                  'Discover a wide range of products across multiple industries and categories.',
              },
              {
                icon: MessageSquareQuote,
                title: 'RFQ & Inquiries',
                description:
                  'Request quotations and communicate directly with suppliers for customized deals.',
              },
              {
                icon: Users,
                title: 'Buyer & Supplier Dashboards',
                description:
                  'Manage orders, payments, and communications through powerful dashboards.',
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-6">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================= TRUST & GLOBAL PRESENCE ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
              Global Presence
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Connecting Businesses Worldwide
            </h2>
            <p className="mt-4 text-slate-600 leading-7">
              GTH is strategically focused on facilitating trade between Asia,
              the Middle East, and emerging markets. By leveraging digital
              innovation and trusted partnerships, we enable seamless
              cross-border transactions and long-term business relationships.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-700">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-600" />
                Indonesia & Afghanistan Launch Markets
              </span>
              <span className="flex items-center gap-2">
                <Handshake className="h-4 w-4 text-amber-600" />
                Trusted Trade Partnerships
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">
              Join the Global Trade House Network
            </h3>
            <p className="mt-4 text-slate-600 leading-7">
              Whether you are a supplier looking to expand your reach or a buyer
              searching for reliable partners, GTH provides the tools and
              infrastructure to help your business thrive in the global market.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Create an Account
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Start Trading with Confidence
          </h2>
          <p className="mt-4 text-slate-600 leading-7">
            Join GTH – Global Trade House today and unlock new opportunities in
            international trade with a secure and scalable B2B marketplace.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/products"
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Browse Products
            </Link>
            <Link
              href="/dashboard/onboarding/vendor"
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Become a Supplier
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}