// app/(public)/privacy/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Database,
  CreditCard,
  Globe,
  Lock,
  Cookie,
  Mail,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | GTH – Global Trade House',
  description:
    'Learn how GTH – Global Trade House collects, uses, and protects your personal information when using our B2B marketplace.',
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

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">
            At <span className="font-semibold text-slate-900">GTH – Global Trade House</span>,
            we are committed to protecting your privacy and ensuring that your
            personal information is handled in a safe and responsible manner.
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
                  { id: 'introduction', label: 'Introduction' },
                  { id: 'information', label: 'Information We Collect' },
                  { id: 'usage', label: 'How We Use Information' },
                  { id: 'sharing', label: 'Information Sharing' },
                  { id: 'cookies', label: 'Cookies & Tracking' },
                  { id: 'security', label: 'Data Security' },
                  { id: 'retention', label: 'Data Retention' },
                  { id: 'rights', label: 'Your Rights' },
                  { id: 'international', label: 'International Transfers' },
                  { id: 'children', label: 'Children’s Privacy' },
                  { id: 'changes', label: 'Policy Updates' },
                  { id: 'contact', label: 'Contact Us' },
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
            <Section id="introduction" title="1. Introduction">
              <p>
                This Privacy Policy explains how GTH – Global Trade House
                (“GTH”, “we”, “our”, or “us”) collects, uses, and protects your
                personal information when you access or use our B2B marketplace.
              </p>
            </Section>

            <Section id="information" title="2. Information We Collect">
              <h3 className="font-semibold text-slate-900">
                a. Personal Information
              </h3>
              <ul className="list-disc pl-6">
                <li>Name and contact details (email, phone number)</li>
                <li>Company and business information</li>
                <li>Account login credentials</li>
                <li>Shipping and billing addresses</li>
              </ul>

              <h3 className="font-semibold text-slate-900 mt-4">
                b. Transaction Information
              </h3>
              <ul className="list-disc pl-6">
                <li>Order and payment details</li>
                <li>Invoices and transaction history</li>
                <li>RFQs and inquiries</li>
              </ul>

              <h3 className="font-semibold text-slate-900 mt-4">
                c. Technical Information
              </h3>
              <ul className="list-disc pl-6">
                <li>IP address and browser type</li>
                <li>Device and usage data</li>
                <li>Cookies and analytics data</li>
              </ul>
            </Section>

            <Section id="usage" title="3. How We Use Your Information">
              <ul className="list-disc pl-6">
                <li>To create and manage user accounts</li>
                <li>To process transactions and payments via Stripe</li>
                <li>To connect buyers with suppliers</li>
                <li>To improve platform functionality and security</li>
                <li>To send important notifications and updates</li>
                <li>To comply with legal and regulatory obligations</li>
              </ul>
            </Section>

            <Section id="sharing" title="4. Information Sharing">
              <p>
                We do not sell your personal information. However, we may share
                your data with:
              </p>
              <ul className="list-disc pl-6">
                <li>
                  <strong>Service Providers:</strong> Including Supabase
                  (authentication and database services) and Stripe (payment
                  processing).
                </li>
                <li>
                  <strong>Business Partners:</strong> Buyers and suppliers to
                  facilitate transactions.
                </li>
                <li>
                  <strong>Legal Authorities:</strong> When required by law or to
                  protect our rights.
                </li>
              </ul>
            </Section>

            <Section id="cookies" title="5. Cookies & Tracking Technologies">
              <p>
                GTH uses cookies and similar technologies to enhance user
                experience, analyze platform usage, and provide personalized
                services. Users can manage cookie preferences through their
                browser settings.
              </p>
            </Section>

            <Section id="security" title="6. Data Security">
              <p>
                We implement industry-standard security measures, including
                encryption and secure access controls, to protect your personal
                information. Payment data is processed securely by Stripe and is
                not stored on our servers.
              </p>
            </Section>

            <Section id="retention" title="7. Data Retention">
              <p>
                We retain personal information only as long as necessary to
                fulfill the purposes outlined in this policy or to comply with
                legal obligations.
              </p>
            </Section>

            <Section id="rights" title="8. Your Rights">
              <p>
                Depending on your jurisdiction, you may have the following
                rights:
              </p>
              <ul className="list-disc pl-6">
                <li>Access to your personal data</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your data</li>
                <li>Restriction or objection to processing</li>
                <li>Data portability</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the details
                provided below.
              </p>
            </Section>

            <Section id="international" title="9. International Data Transfers">
              <p>
                As a global platform operating in Indonesia and Afghanistan,
                your information may be transferred and processed in other
                jurisdictions where our service providers operate. We ensure
                appropriate safeguards are in place to protect your data.
              </p>
            </Section>

            <Section id="children" title="10. Children’s Privacy">
              <p>
                GTH is not intended for individuals under the age of 18. We do
                not knowingly collect personal information from children.
              </p>
            </Section>

            <Section id="changes" title="11. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. Any changes
                will be posted on this page with an updated “Last updated” date.
              </p>
            </Section>

            <Section id="contact" title="12. Contact Us">
              <p>
                If you have any questions or concerns about this Privacy Policy,
                please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li>
                  <Mail className="inline mr-2 h-4 w-4 text-amber-600" />
                  Email:{' '}
                  <a
                    href="mailto:support@gth.com"
                    className="text-amber-600 hover:underline"
                  >
                    support@gth.com
                  </a>
                </li>
                <li>
                  <Globe className="inline mr-2 h-4 w-4 text-amber-600" />
                  Website:{' '}
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