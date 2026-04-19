import type { Metadata } from 'next'
import Link from 'next/link'
import { Cookie, Settings, ShieldCheck, BarChart3, Mail } from 'lucide-react'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'GTH – Global Trade House'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@gth.com'

export const metadata: Metadata = {
  title: `Cookie Policy | ${siteName}`,
  description:
    'Learn how cookies and similar technologies are used on the GTH platform to enhance your browsing experience.',
  openGraph: {
    title: `Cookie Policy | ${siteName}`,
    description:
      'Understand how GTH uses cookies to improve functionality, analytics, and security.',
    url: `${siteUrl}/cookies`,
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

export default function CookiesPage() {
  const lastUpdated = new Date().toLocaleDateString()

  return (
    <main className="bg-white text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <Cookie className="mx-auto h-12 w-12 text-amber-600" />
          <h1 className="mt-4 text-4xl font-bold">Cookie Policy</h1>
          <p className="mt-3 text-slate-600">
            This Cookie Policy explains how <strong>{siteName}</strong> uses
            cookies and similar technologies to recognize you when you visit our
            platform.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <Section title="1. What Are Cookies?">
          <p>
            Cookies are small text files stored on your device when you visit a
            website. They help us improve your browsing experience, remember your
            preferences, and analyze site performance.
          </p>
        </Section>

        <Section title="2. Types of Cookies We Use">
          <ul className="list-disc pl-6">
            <li>
              <strong>Essential Cookies:</strong> Required for authentication and
              platform functionality.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Help us understand how users
              interact with our platform.
            </li>
            <li>
              <strong>Functional Cookies:</strong> Remember user preferences such
              as language and region.
            </li>
            <li>
              <strong>Security Cookies:</strong> Protect against fraud and ensure
              secure transactions.
            </li>
          </ul>
        </Section>

        <Section title="3. Third-Party Cookies">
          <p>
            We may use trusted third-party services such as:
          </p>
          <ul className="list-disc pl-6">
            <li>Supabase – Authentication and database services</li>
            <li>Stripe – Secure payment processing</li>
            <li>Analytics providers – To understand user behavior</li>
          </ul>
        </Section>

        <Section title="4. Managing Cookies">
          <p>
            You can control and manage cookies through your browser settings.
            Disabling essential cookies may affect the functionality of the
            platform.
          </p>
        </Section>

        <Section title="5. Updates to This Policy">
          <p>
            We may update this Cookie Policy periodically. Any changes will be
            posted on this page with an updated revision date.
          </p>
        </Section>

        <Section title="6. Contact Us">
          <p>
            If you have any questions about this Cookie Policy, please contact us
            at:
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
            You can also review our{' '}
            <Link href="/privacy" className="text-amber-600 hover:underline">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="text-amber-600 hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </Section>
      </div>
    </main>
  )
}