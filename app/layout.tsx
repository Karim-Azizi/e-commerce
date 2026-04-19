// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
  ),
  title: {
    default: 'GTH',
    template: '%s | GTH',
  },
  description:
    'GTH is a premium B2B marketplace connecting buyers and suppliers through products, orders, payments, inquiries, and RFQs.',
  keywords: [
    'B2B marketplace',
    'suppliers',
    'products',
    'wholesale',
    'GTH',
    'Indonesia',
    'Afghanistan',
  ],
  openGraph: {
    title: 'GTH',
    description:
      'Discover suppliers, products, and business opportunities on GTH.',
    url: '/',
    siteName: 'GTH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GTH',
    description:
      'A premium B2B marketplace connecting buyers and suppliers.',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f7f8fa] text-slate-900 antialiased">
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(148,163,184,0.08),_transparent_30%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
          {/* Decorative gradient overlay */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(255,255,255,0))]" />
          {children}
        </div>
      </body>
    </html>
  )
}