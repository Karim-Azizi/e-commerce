'use client'

export function DashboardFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-4 text-sm text-slate-500">
      <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
        <p>
          © {new Date().getFullYear()} GTH. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a href="/support" className="hover:text-slate-900">
            Help Center
          </a>
          <a href="/contact" className="hover:text-slate-900">
            Contact Us
          </a>
          <a href="/about" className="hover:text-slate-900">
            About
          </a>
        </div>
      </div>
    </footer>
  )
}