'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import slugify from 'slugify'
import { randomUUID } from 'crypto'

type UserRole = 'buyer' | 'vendor'

/* -------------------------------------------------------------------------- */
/*                          SAFE REDIRECT HANDLING                            */
/* -------------------------------------------------------------------------- */
function safeRedirectTarget(
  value: FormDataEntryValue | null | undefined,
  fallback = '/dashboard'
) {
  const input = String(value || '').trim()

  // Prevent empty or external redirects
  if (!input) return fallback
  if (!input.startsWith('/')) return fallback
  if (input.startsWith('//')) return fallback

  // Prevent redirect loops
  if (input.startsWith('/login') || input.startsWith('/signup')) {
    return fallback
  }

  return input
}

function buildRedirectUrl(
  basePath: string,
  params: Record<string, string | null | undefined>
) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      search.set(key, value)
    }
  })

  const query = search.toString()
  return query ? `${basePath}?${query}` : basePath
}

/* -------------------------------------------------------------------------- */
/*                                    LOGIN                                   */
/* -------------------------------------------------------------------------- */
export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const redirectTo = safeRedirectTarget(
    formData.get('redirect_to'),
    '/dashboard'
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    redirect(
      buildRedirectUrl('/login', {
        message: error?.message || 'Invalid email or password',
        redirect_to: redirectTo,
      })
    )
  }

  // Ensure user profile exists (Alibaba-style unified account)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!existingProfile) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email,
      full_name:
        (data.user.user_metadata?.full_name as string) ||
        (data.user.user_metadata?.name as string) ||
        data.user.email?.split('@')[0] ||
        'User',
      role:
        data.user.user_metadata?.role === 'vendor'
          ? 'vendor'
          : 'buyer',
    })
  }

  // Revalidate to ensure session cookies are available
  revalidatePath('/', 'layout')

  // Redirect to intended destination (e.g., Stripe payment page)
  redirect(redirectTo)
}

/* -------------------------------------------------------------------------- */
/*                                   SIGNUP                                   */
/* -------------------------------------------------------------------------- */
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const fullName = String(formData.get('full_name') || '').trim()
  const selectedRole = String(formData.get('role') || 'buyer')
    .trim()
    .toLowerCase()
  const redirectTo = safeRedirectTarget(
    formData.get('redirect_to'),
    '/dashboard'
  )

  const role: UserRole =
    selectedRole === 'supplier' || selectedRole === 'vendor'
      ? 'vendor'
      : 'buyer'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  })

  if (error) {
    redirect(
      buildRedirectUrl('/signup', {
        message: error.message || 'Could not create account',
        redirect_to: redirectTo,
      })
    )
  }

  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
      role,
    })
  }

  // Redirect to login while preserving the intended destination
  redirect(
    buildRedirectUrl('/login', {
      message: 'Account created successfully. Please log in to continue.',
      redirect_to: redirectTo,
    })
  )
}

/* -------------------------------------------------------------------------- */
/*                                   LOGOUT                                   */
/* -------------------------------------------------------------------------- */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

/* -------------------------------------------------------------------------- */
/*                              CREATE VENDOR                                 */
/* -------------------------------------------------------------------------- */
function generateSlug(name: string) {
  return `${slugify(name, { lower: true, strict: true })}-${randomUUID().slice(
    0,
    8
  )}`
}

export async function createVendor(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const companyName = String(formData.get('company_name') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const country = String(formData.get('country') || '').trim()
  const city = String(formData.get('city') || '').trim()
  const address = String(formData.get('address') || '').trim()

  if (!companyName) {
    redirect(
      '/dashboard/onboarding/vendor?message=Company%20name%20is%20required'
    )
  }

  const slug = generateSlug(companyName)

  const { data: existingVendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingVendor) {
    redirect('/dashboard?message=Vendor%20profile%20already%20exists')
  }

  const { error } = await supabase.from('vendors').insert({
    user_id: user.id,
    company_name: companyName,
    slug,
    description,
    country,
    city,
    address,
    verified: false,
    rating: 0,
  })

  if (error) {
    redirect(
      `/dashboard/onboarding/vendor?message=${encodeURIComponent(
        error.message || 'Failed to create vendor profile'
      )}`
    )
  }

  // Update user role to vendor
  await supabase
    .from('profiles')
    .update({ role: 'vendor' })
    .eq('id', user.id)

  revalidatePath('/dashboard', 'layout')

  redirect('/dashboard?message=Vendor%20profile%20created%20successfully')
}