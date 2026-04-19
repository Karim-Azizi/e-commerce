'use client'

import Link from 'next/link'
import { Bell, Globe, LogOut, Menu } from 'lucide-react'
import { logout } from '@/app/auth/actions'

type DashboardNavbarProps = {
  user: {
    name: string
    email: string
    role: 'buyer' | 'vendor' | 'admin'
  }
  onMenuClick?: () => void
}

export function DashboardNavbar({
  user,
  onMenuClick,
}: DashboardNavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Branding */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold">
            AP
          </div>
          <span className="text-lg font-bold text-slate-900">
            Alibaba <span className="text-amber-600">Plus</span>
          </span>
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Marketplace Link */}
        <Link
          href="/"
          className="hidden items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 md:flex"
        >
          <Globe className="h-4 w-4" />
          View Marketplace
        </Link>

        {/* Notifications */}
        <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />
        </button>

        {/* User Info */}
        <div className="hidden text-right md:block">
          <p className="text-sm font-semibold text-slate-900">
            {user.name}
          </p>
          <p className="text-xs text-slate-500 capitalize">{user.role}</p>
        </div>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
          {user.name?.charAt(0).toUpperCase()}
        </div>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}