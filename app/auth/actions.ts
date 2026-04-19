'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import slugify from 'slugify'
import { randomUUID } from 'crypto'

function toText(value: FormDataEntryValue | null | undefined) {
  return String(value ?? '').trim()
}

function safeMessage(message: string) {
  return encodeURIComponent(message)
}

function generateSlug(value: string) {
  const base = slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  })

  return `${base || 'vendor'}-${randomUUID().slice(0, 8)}`
}

async function ensureProfileExists({
  supabase,
  userId,
  email,
  fullName,
  role = 'buyer',
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  email: string
  fullName?: string
  role?: 'buyer' | 'vendor' | 'admin'
}) {
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (existingProfile) return

  await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: fullName || email.split('@')[0]?.replace(/[._-]/g, ' ') || 'User',
    role,
  })
}

/* -------------------------------------------------------------------------- */
/*                                    LOGIN                                   */
/* -------------------------------------------------------------------------- */
export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = toText(formData.get('email')).toLowerCase()
  const password = toText(formData.get('password'))

  if (!email || !password) {
    redirect('/login?message=Email and password are required')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?message=Invalid email or password')
  }

  redirect('/dashboard')
}

/* -------------------------------------------------------------------------- */
/*                                   SIGNUP                                   */
/* -------------------------------------------------------------------------- */
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = toText(formData.get('email')).toLowerCase()
  const password = toText(formData.get('password'))
  const fullName = toText(formData.get('full_name'))

  if (!email || !password) {
    redirect('/signup?message=Email and password are required')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    redirect(
      `/signup?message=${safeMessage(
        error.message || 'Could not create account'
      )}`
    )
  }

  if (data.user) {
    await ensureProfileExists({
      supabase,
      userId: data.user.id,
      email: data.user.email || email,
      fullName,
      role: 'buyer',
    })
  }

  redirect('/login?message=Account created. Please log in')
}

/* -------------------------------------------------------------------------- */
/*                                   LOGOUT                                   */
/* -------------------------------------------------------------------------- */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

/* -------------------------------------------------------------------------- */
/*                              CREATE VENDOR                                 */
/* -------------------------------------------------------------------------- */
export async function createVendor(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Support multiple field names so onboarding stays resilient
  const companyName =
    toText(formData.get('company_name')) ||
    toText(formData.get('companyName')) ||
    toText(formData.get('company')) ||
    toText(formData.get('name'))

  const providedSlug =
    toText(formData.get('slug')) ||
    toText(formData.get('company_slug')) ||
    toText(formData.get('vendor_slug'))

  const description = toText(formData.get('description'))
  const country = toText(formData.get('country'))
  const city = toText(formData.get('city'))
  const address = toText(formData.get('address'))

  if (!companyName) {
    redirect(
      '/dashboard/onboarding/vendor?message=Company name is required'
    )
  }

  if (!country) {
    redirect('/dashboard/onboarding/vendor?message=Country is required')
  }

  const slugBase =
    slugify(providedSlug || companyName, {
      lower: true,
      strict: true,
      trim: true,
    }) || 'vendor'

  const {
    data: existingVendorForUser,
    error: existingVendorForUserError,
  } = await supabase
    .from('vendors')
    .select('id, slug')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingVendorForUserError) {
    redirect(
      `/dashboard/onboarding/vendor?message=${safeMessage(
        existingVendorForUserError.message
      )}`
    )
  }

  if (existingVendorForUser) {
    redirect('/dashboard?message=Vendor profile already exists')
  }

  let finalSlug = slugBase

  const { data: existingSlugVendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('slug', finalSlug)
    .maybeSingle()

  if (existingSlugVendor) {
    finalSlug = generateSlug(slugBase)
  }

  await ensureProfileExists({
    supabase,
    userId: user.id,
    email: user.email || '',
    fullName:
      user.user_metadata?.full_name ||
      user.email?.split('@')[0]?.replace(/[._-]/g, ' ') ||
      'User',
    role: 'buyer',
  })

  const { error: insertError } = await supabase.from('vendors').insert({
    user_id: user.id,
    company_name: companyName,
    slug: finalSlug,
    description: description || null,
    country,
    city: city || null,
    address: address || null,
    verified: false,
    rating: 0,
  })

  if (insertError) {
    redirect(
      `/dashboard/onboarding/vendor?message=${safeMessage(
        insertError.message || 'Failed to create vendor profile'
      )}`
    )
  }

  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({
      role: 'vendor',
      full_name:
        user.user_metadata?.full_name ||
        user.email?.split('@')[0]?.replace(/[._-]/g, ' ') ||
        'User',
      email: user.email || '',
    })
    .eq('id', user.id)

  if (profileUpdateError) {
    redirect(
      `/dashboard/onboarding/vendor?message=${safeMessage(
        profileUpdateError.message || 'Vendor created but profile update failed'
      )}`
    )
  }

  redirect('/dashboard?message=Vendor profile created successfully')
}