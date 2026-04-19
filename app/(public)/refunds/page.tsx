import type { Metadata } from 'next'
import Link from 'next/link'
import { CreditCard, RefreshCcw, ShieldCheck, AlertTriangle, Mail } from 'lucide-react'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'GTH – Global Trade House'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@gth.com'

export const metadata: Metadata = {
  title: `Refund & Dispute Policy | ${siteName}`,
  description:
    'Understand the refund and dispute procedures for transactions conducted on the GTH platform.',
  openGraph: {
    title: `Refund & Dispute Policy | ${siteName}`,
    description:
      'Learn how refunds and disputes are handled on the GTH marketplace.',
    url: `${siteUrl}/refunds`,
    siteName,
    type: 'article',
  },
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4 text-slate-600 leading-7">{children}</div>
    </section>
  )
}

export default function RefundsPage() {
  const lastUpdated = new Date().toLocaleDateString()

  return (
    <main className="bg-white text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <RefreshCcw className="mx-auto h-12 w-12 text-amber-600" />
          <h1 className="mt-4 text-4xl font-bold">Refund & Dispute Policy</h1>
          <p className="mt-3 text-slate-600">
            This policy outlines the procedures for refunds and dispute
            resolution on the <strong>{siteName}</strong> platform.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <Section title="1. Overview">
          <p>
            GTH acts as a B2B marketplace connecting buyers and suppliers. While
            we facilitate transactions, the responsibility for product quality
            and delivery rests with the supplier.
          </p>
        </Section>

        <Section title="2. Eligibility for Refunds">
          <ul className="list-disc pl-6">
            <li>Products not delivered within the agreed timeframe.</li>
            <li>Items significantly different from their description.</li>
            <li>Damaged or defective products upon arrival.</li>
            <li>Duplicate or unauthorized transactions.</li>
          </ul>
        </Section>

        <Section title="3. Refund Process">
          <ol className="list-decimal pl-6">
            <li>Buyer submits a dispute through their dashboard.</li>
            <li>Supplier is notified and given an opportunity to respond.</li>
            <li>GTH may mediate the dispute if necessary.</li>
            <li>
              Approved refunds are processed via the original payment method
              through Stripe.
            </li>
          </ol>
        </Section>

        <Section title="4. Dispute Resolution">
          <p>
            In the event of a disagreement, GTH will act as a neutral mediator to
            facilitate communication between the buyer and supplier. Final
            decisions may depend on supporting evidence provided by both parties.
          </p>
        </Section>

        <Section title="5. Non-Refundable Situations">
          <ul className="list-disc pl-6">
            <li>Buyer’s change of mind after shipment.</li>
            <li>Failure to comply with import/export regulations.</li>
            <li>Incorrect shipping information provided by the buyer.</li>
          </ul>
        </Section>

        <Section title="6. Processing Time">
          <p>
            Once approved, refunds are typically processed within 5–10 business
            days, depending on the payment provider and banking institution.
          </p>
        </Section>

        <Section title="7. Contact for Disputes">
          <p>
            For assistance with refunds or disputes, please contact our support
            team:
          </p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-amber-600" />
            <a
              href={`mailto:${supportEmail}`}
              className="text-amber-600 hover:underline"
            >
              {supportEmail}
            </a>
          </p>
          <p className="mt-2">
            You may also review our{' '}
            <Link href="/terms" className="text-amber-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-amber-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </Section>
      </div>
    </main>
  )
}