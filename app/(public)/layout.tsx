// app/(public)/layout.tsx
import { createPublicClient, getPublicStorageUrl } from '@/lib/supabase/server'
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
    <div className="flex min-h-screen flex-col">
      {/* Public Navigation */}
      <PublicNavbar user={currentUser} />

      {/* Main Content */}
      <main className="relative z-10 flex-1">{children}</main>

      {/* Public Footer */}
      <PublicFooter user={currentUser} />
    </div>
  )
}