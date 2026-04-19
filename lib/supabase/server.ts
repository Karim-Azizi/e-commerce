// lib/supabase/server.ts

import { createServerClient } from '@supabase/ssr'
import {
  createClient as createSupabaseJsClient,
  type SupabaseClient,
} from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/* -------------------------------------------------------------------------- */
/*                            ENVIRONMENT VARIABLES                           */
/* -------------------------------------------------------------------------- */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/* -------------------------------------------------------------------------- */
/*                         AUTH-AWARE SERVER CLIENT                           */
/* -------------------------------------------------------------------------- */
/**
 * Use this client for authenticated server components, dashboard layouts,
 * and server actions. Compatible with Next.js 16 and Turbopack.
 */
export async function createClient(): Promise<SupabaseClient> {
  // In Next.js 16, cookies() may return a Promise
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      /**
       * Required by @supabase/ssr
       */
      getAll() {
        return cookieStore.getAll()
      },

      /**
       * Required by @supabase/ssr
       */
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // In Server Components, cookies may be read-only.
          // This is safe to ignore because middleware handles persistence.
        }
      },
    },
  })
}

/* -------------------------------------------------------------------------- */
/*                         PUBLIC (ANONYMOUS) CLIENT                          */
/* -------------------------------------------------------------------------- */
/**
 * Use this client for public marketplace pages such as:
 * - /products
 * - /vendors
 * - /categories
 * - /rfqs
 *
 * Ensures consistent behavior across all browsers without relying on sessions.
 */
export function createPublicClient(): SupabaseClient {
  return createSupabaseJsClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

/* -------------------------------------------------------------------------- */
/*                         SERVICE ROLE ADMIN CLIENT                          */
/* -------------------------------------------------------------------------- */
/**
 * Use ONLY for secure server-side operations that must bypass RLS.
 * Never expose this client to the browser.
 */
export function createAdminClient(): SupabaseClient {
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return createSupabaseJsClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

/* -------------------------------------------------------------------------- */
/*                       PUBLIC STORAGE URL HELPER                            */
/* -------------------------------------------------------------------------- */
/**
 * Converts a storage path or full URL into a public URL.
 * Since your database already stores FULL URLs, they are returned as-is.
 */
export function getPublicStorageUrl(
  bucket: string,
  pathOrUrl?: string | null
): string | null {
  const value = String(pathOrUrl ?? '').trim()
  if (!value) return null

  // If already a full URL, return it directly
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }

  // Construct public URL from storage path
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${value}`
}

/* -------------------------------------------------------------------------- */
/*                              URL VALIDATOR                                 */
/* -------------------------------------------------------------------------- */

export function isAbsoluteUrl(value?: string | null): boolean {
  const input = String(value ?? '').trim()
  return input.startsWith('http://') || input.startsWith('https://')
}