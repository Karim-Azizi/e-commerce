// app/(public)/terms/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FileText,
  ShieldCheck,
  CreditCard,
  Users,
  AlertTriangle,
  Gavel,
  Globe,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | GTH – Global Trade House',
  description:
    'Read the Terms of Service for GTH – Global Trade House, outlining the rules, responsibilities, and legal agreements for using our B2B marketplace.',
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mt-10 text-2xl font-bold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4 text-slate-600 leading-7">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  const lastUpdated = 'April 2026'

  return (
    <main className="bg-white text-slate-900">
      {/* ================= HERO ================= */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">
            These Terms of Service govern your access to and use of the
            <span className="font-semibold text-slate-900">
              {' '}
              GTH – Global Trade House
            </span>{' '}
            platform. By using our services, you agree to comply with these
            terms and all applicable laws and regulations.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* ===== Table of Contents ===== */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                On this page
              </h3>
              <nav className="mt-4 space-y-2 text-sm">
                {[
                  { id: 'acceptance', label: 'Acceptance of Terms' },
                  { id: 'services', label: 'Description of Services' },
                  { id: 'accounts', label: 'User Accounts' },
                  { id: 'buyers', label: 'Buyer Responsibilities' },
                  { id: 'suppliers', label: 'Supplier Responsibilities' },
                  { id: 'payments', label: 'Payments & Fees' },
                  { id: 'prohibited', label: 'Prohibited Activities' },
                  { id: 'intellectual', label: 'Intellectual Property' },
                  { id: 'liability', label: 'Limitation of Liability' },
                  { id: 'termination', label: 'Termination' },
                  { id: 'law', label: 'Governing Law' },
                  { id: 'contact', label: 'Contact Information' },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-slate-600 hover:text-amber-600"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* ===== Main Content ===== */}
          <div className="lg:col-span-3">
            <Section id="acceptance" title="1. Acceptance of Terms">
              <p>
                By accessing or using the GTH platform, you agree to be bound by
                these Terms of Service. If you do not agree to these terms,
                please discontinue use of the platform immediately.
              </p>
            </Section>

            <Section id="services" title="2. Description of Services">
              <p>
                GTH – Global Trade House is a B2B marketplace that connects
                buyers and suppliers globally. Our services include:
              </p>
              <ul className="list-disc pl-6">
                <li>Product listings and supplier storefronts</li>
                <li>Request for Quotation (RFQ) functionality</li>
                <li>Secure payment processing via Stripe</li>
                <li>Order and inquiry management</li>
                <li>Buyer and supplier dashboards</li>
              </ul>
            </Section>

            <Section id="accounts" title="3. User Accounts">
              <p>
                Users must provide accurate and complete information when
                creating an account. You are responsible for maintaining the
                confidentiality of your login credentials and for all activities
                that occur under your account.
              </p>
            </Section>

            <Section id="buyers" title="4. Buyer Responsibilities">
              <p>Buyers using the platform agree to:</p>
              <ul className="list-disc pl-6">
                <li>Provide accurate purchase and shipping information.</li>
                <li>Comply with all applicable import and export regulations.</li>
                <li>Make timely payments for confirmed orders.</li>
                <li>Communicate respectfully with suppliers.</li>
              </ul>
            </Section>

            <Section id="suppliers" title="5. Supplier Responsibilities">
              <p>Suppliers agree to:</p>
              <ul className="list-disc pl-6">
                <li>Provide accurate product descriptions and pricing.</li>
                <li>Ensure the legality and quality of listed products.</li>
                <li>Fulfill orders in a timely and professional manner.</li>
                <li>Comply with international trade and export regulations.</li>
              </ul>
            </Section>

            <Section id="payments" title="6. Payments & Fees">
              <p>
                Payments on the GTH platform are processed securely through
                third-party providers such as Stripe. GTH does not store
                sensitive payment information. Any applicable service fees will
                be clearly disclosed prior to transaction completion.
              </p>
            </Section>

            <Section id="prohibited" title="7. Prohibited Activities">
              <p>Users may not engage in activities including but not limited to:</p>
              <ul className="list-disc pl-6">
                <li>Fraudulent or deceptive practices.</li>
                <li>Listing illegal or prohibited products.</li>
                <li>Violating intellectual property rights.</li>
                <li>Attempting unauthorized access to the platform.</li>
              </ul>
            </Section>

            <Section id="intellectual" title="8. Intellectual Property">
              <p>
                All content on the GTH platform, including logos, text, graphics,
                and software, is the property of GTH or its licensors and is
                protected by applicable intellectual property laws.
              </p>
            </Section>

            <Section id="liability" title="9. Limitation of Liability">
              <p>
                GTH acts as an intermediary between buyers and suppliers and is
                not responsible for the quality, safety, legality, or delivery
                of products. To the maximum extent permitted by law, GTH shall
                not be liable for any indirect or consequential damages arising
                from the use of the platform.
              </p>
            </Section>

            <Section id="termination" title="10. Termination">
              <p>
                GTH reserves the right to suspend or terminate user accounts at
                its discretion if these Terms of Service are violated or if
                unlawful activities are suspected.
              </p>
            </Section>

            <Section id="law" title="11. Governing Law">
              <p>
                These Terms shall be governed by and interpreted in accordance
                with the laws applicable in the jurisdictions where GTH
                operates, particularly Indonesia and Afghanistan, without
                regard to conflict of law principles.
              </p>
            </Section>

            <Section id="contact" title="12. Contact Information">
              <p>
                If you have any questions regarding these Terms of Service,
                please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li>
                  📧 Email:{' '}
                  <a
                    href="mailto:support@gth.com"
                    className="text-amber-600 hover:underline"
                  >
                    support@gth.com
                  </a>
                </li>
                <li>
                  🌐 Website:{' '}
                  <Link href="/" className="text-amber-600 hover:underline">
                    www.gth.com
                  </Link>
                </li>
              </ul>
            </Section>
          </div>
        </div>
      </section>
    </main>
  )
}