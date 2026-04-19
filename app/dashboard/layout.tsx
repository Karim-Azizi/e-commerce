// app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/shell'

type UserRole = 'buyer' | 'vendor' | 'admin'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch or create user profile
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile && !profileError) {
    const { data: insertedProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        role: 'buyer',
        full_name:
          user.user_metadata?.full_name ||
          user.email?.split('@')[0]?.replace(/[._-]/g, ' ') ||
          'User',
      })
      .select()
      .single()

    profile = insertedProfile
  }

  const role: UserRole =
    profile?.role === 'vendor' || profile?.role === 'admin'
      ? profile.role
      : 'buyer'

  // Ensure vendor onboarding
  if (role === 'vendor') {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!vendor) {
      redirect('/dashboard/onboarding/vendor')
    }
  }

  const userName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0]?.replace(/[._-]/g, ' ') ||
    'User'

  const userEmail = profile?.email || user.email || ''

  return (
    <DashboardShell
      user={{
        name: userName,
        email: userEmail,
        role,
      }}
    >
      <div className="w-full min-w-0 max-w-full overflow-x-hidden break-words text-slate-900">
        <div className="min-w-0 whitespace-normal [overflow-wrap:anywhere]">
          {children}
        </div>
      </div>
    </DashboardShell>
  )
}