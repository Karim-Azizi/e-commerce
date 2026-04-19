import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .maybeSingle()

  let storeSettings = null

  if (profile?.role === 'vendor') {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (vendor) {
      const { data } = await supabase
        .from('store_settings')
        .select('logo, banner, theme, created_at')
        .eq('vendor_id', vendor.id)
        .maybeSingle()

      storeSettings = data
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Account and store preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Account</h2>
          <div className="mt-4 space-y-3 text-sm">
            <p><span className="font-medium">Name:</span> {profile?.full_name || 'N/A'}</p>
            <p><span className="font-medium">Email:</span> {profile?.email || user.email || 'N/A'}</p>
            <p><span className="font-medium capitalize">Role:</span> {profile?.role || 'buyer'}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Store</h2>
          {profile?.role === 'vendor' ? (
            <div className="mt-4 space-y-3 text-sm">
              <p><span className="font-medium">Theme:</span> {storeSettings?.theme || 'Default'}</p>
              <p><span className="font-medium">Logo:</span> {storeSettings?.logo || 'Not set'}</p>
              <p><span className="font-medium">Banner:</span> {storeSettings?.banner || 'Not set'}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              Store settings are available after vendor onboarding.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}