// app/(public)/layout.tsx
import { createPublicClient } from '@/lib/supabase/server'
import { PublicNavbar } from '@/components/public/navbar'
import { PublicFooter } from '@/components/public/footer'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createPublicClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentUser: {
    name: string
    email: string
    role: string
  } | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, role')
      .eq('id', user.id)
      .maybeSingle()

    currentUser = {
      name:
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0]?.replace(/[._-]/g, ' ') ||
        'User',
      email: profile?.email || user.email || '',
      role: profile?.role || 'buyer',
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">

      {/* ✅ MOBILE: Sticky Alibaba-style header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm md:static md:shadow-none">
        <PublicNavbar user={currentUser} />
      </div>

      {/* ✅ MAIN CONTENT */}
      <main className="relative z-10 flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* ✅ DESKTOP FOOTER ONLY */}
      <div className="hidden md:block">
        <PublicFooter user={currentUser} />
      </div>

      {/* ✅ MOBILE BOTTOM NAV SPACE (Alibaba style) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
        <div className="flex justify-around py-2 text-xs text-gray-600">
          <div className="flex flex-col items-center">
            <span>🏠</span>
            <span>Home</span>
          </div>
          <div className="flex flex-col items-center">
            <span>👁️</span>
            <span>Tips</span>
          </div>
          <div className="flex flex-col items-center">
            <span>💬</span>
            <span>Chat</span>
          </div>
          <div className="flex flex-col items-center">
            <span>🛒</span>
            <span>Cart</span>
          </div>
          <div className="flex flex-col items-center">
            <span>👤</span>
            <span>Account</span>
          </div>
        </div>
      </div>
    </div>
  )
}