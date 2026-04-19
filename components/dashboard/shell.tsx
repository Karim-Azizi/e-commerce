'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { DashboardNavbar } from './navbar'
import { DashboardFooter } from './footer'
import { X } from 'lucide-react'
import clsx from 'clsx'

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type UserRole = 'buyer' | 'vendor' | 'admin'

type DashboardShellProps = {
  children: React.ReactNode
  user: {
    name: string
    email: string
    role: UserRole
  }
}

/* -------------------------------------------------------------------------- */
/*                           Role-Based Configuration                         */
/* -------------------------------------------------------------------------- */

const roleConfig: Record<
  UserRole,
  {
    label: string
    description: string
    gradient: string
  }
> = {
  buyer: {
    label: 'Buyer Workspace',
    description:
      'Manage orders, communicate with suppliers, and explore RFQs.',
    gradient: 'from-emerald-50 to-teal-50 border-emerald-100 text-emerald-700',
  },
  vendor: {
    label: 'Supplier Workspace',
    description:
      'Manage products, storefront, inquiries, and grow your business.',
    gradient: 'from-amber-50 to-orange-50 border-amber-100 text-amber-700',
  },
  admin: {
    label: 'Admin Workspace',
    description:
      'Oversee marketplace activity, users, and platform operations.',
    gradient: 'from-purple-50 to-fuchsia-50 border-purple-100 text-purple-700',
  },
}

/* -------------------------------------------------------------------------- */
/*                              Dashboard Shell                               */
/* -------------------------------------------------------------------------- */

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const roleInfo = roleConfig[user.role]

  /* --------------------------- Prevent body scroll -------------------------- */
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  /* ------------------------------- Render ---------------------------------- */
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ------------------------------------------------------------------ */}
      {/* Sidebar (Desktop + Mobile Drawer)                                  */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar Navigation"
      >
        <Sidebar
          role={user.role}
          onNavigate={() => setSidebarOpen(false)}
        />

        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Overlay for Mobile                                                 */}
      {/* ------------------------------------------------------------------ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Main Content Area                                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Navbar */}
        <DashboardNavbar
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Workspace Indicator (Alibaba-style context banner) */}
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div
            className={clsx(
              'rounded-2xl border bg-gradient-to-r p-4',
              roleInfo.gradient
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              Current Workspace
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              {roleInfo.label}
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              {roleInfo.description}
            </p>
          </div>
        </div>

        {/* Main Page Content */}
        <main className="flex-1 px-6 py-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>

        {/* Footer */}
        <DashboardFooter />
      </div>
    </div>
  )
}