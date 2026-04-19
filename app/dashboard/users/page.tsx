import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  avatar_url: string | null
  created_at: string | null
}

function getRoleBadge(role: string | null) {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-700'
    case 'vendor':
      return 'bg-amber-100 text-amber-700'
    case 'buyer':
      return 'bg-emerald-100 text-emerald-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export default async function UsersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let { data: currentProfile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url, created_at')
    .eq('id', user.id)
    .maybeSingle()

  if (!currentProfile) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email ?? null,
      full_name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
      role: 'buyer',
      avatar_url: null,
    })

    const retry = await supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url, created_at')
      .eq('id', user.id)
      .maybeSingle()

    currentProfile = retry.data
  }

  if (!currentProfile) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load current user profile.
      </div>
    )
  }

  const isAdmin = currentProfile.role === 'admin'

  let profiles: Profile[] = []

  if (isAdmin) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url, created_at')
      .order('created_at', { ascending: false })

    profiles = data || []
  } else {
    profiles = [currentProfile as Profile]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isAdmin ? 'Users & Roles' : 'My Account'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isAdmin
            ? 'Manage platform users and role visibility.'
            : 'View your account and current role.'}
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length ? (
              profiles.map((profile) => (
                <tr key={profile.id} className="border-b border-slate-100">
                  <td className="px-6 py-4 font-medium">
                    {profile.full_name || 'Unnamed User'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {profile.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRoleBadge(
                        profile.role
                      )}`}
                    >
                      {profile.role || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}