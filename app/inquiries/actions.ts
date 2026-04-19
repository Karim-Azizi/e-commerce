'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createInquiry(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Please log in to send an inquiry')
  }

  const productId = String(formData.get('product_id') || '').trim()
  const vendorId = String(formData.get('vendor_id') || '').trim()
  const productSlug = String(formData.get('product_slug') || '').trim()
  const message = String(formData.get('message') || '').trim()

  if (!productId || !vendorId || !message) {
    redirect(
      `/products/${productSlug}?message=Please complete the inquiry message`
    )
  }

  const { error } = await supabase.from('inquiries').insert({
    product_id: productId,
    vendor_id: vendorId,
    buyer_id: user.id,
    message,
    status: 'new',
  })

  if (error) {
    redirect(
      `/products/${productSlug}?message=${encodeURIComponent(error.message)}`
    )
  }

  redirect(
    `/products/${productSlug}?message=Inquiry sent successfully`
  )
}