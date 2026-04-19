'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const inquiryId = String(formData.get('inquiry_id') || '')
  const receiverId = String(formData.get('receiver_id') || '')
  const content = String(formData.get('content') || '').trim()

  if (!inquiryId || !receiverId || !content) {
    redirect('/dashboard/messages?message=Invalid message data')
  }

  const { error } = await supabase.from('messages').insert({
    inquiry_id: inquiryId,
    sender_id: user.id,
    receiver_id: receiverId,
    content,
  })

  if (error) {
    redirect(
      `/dashboard/messages/${inquiryId}?message=${encodeURIComponent(
        error.message
      )}`
    )
  }

  // Update inquiry status to "replied"
  await supabase
    .from('inquiries')
    .update({ status: 'replied' })
    .eq('id', inquiryId)

  redirect(`/dashboard/messages/${inquiryId}`)
}