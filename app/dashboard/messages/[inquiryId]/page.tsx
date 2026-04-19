import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { sendMessage } from '../actions'

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: { inquiryId: string }
  searchParams: { message?: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', params.inquiryId)
    .single()

  if (!inquiry) redirect('/dashboard/messages')

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('inquiry_id', params.inquiryId)
    .order('created_at', { ascending: true })

  const receiverId =
    inquiry.buyer_id === user.id
      ? inquiry.vendor_id
      : inquiry.buyer_id

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Conversation
      </h1>

      {searchParams.message && (
        <div className="rounded-2xl bg-green-50 p-4 text-green-700">
          {searchParams.message}
        </div>
      )}

      <div className="space-y-4">
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-2xl p-4 ${
              msg.sender_id === user.id
                ? 'bg-slate-900 text-white ml-auto max-w-md'
                : 'bg-slate-100 text-slate-900 mr-auto max-w-md'
            }`}
          >
            <p>{msg.content}</p>
            <p className="mt-2 text-xs opacity-70">
              {new Date(msg.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <form action={sendMessage} className="space-y-4">
        <input
          type="hidden"
          name="inquiry_id"
          value={params.inquiryId}
        />
        <input
          type="hidden"
          name="receiver_id"
          value={receiverId || ''}
        />
        <textarea
          name="content"
          required
          rows={4}
          placeholder="Type your message..."
          className="w-full rounded-xl border border-slate-300 p-3"
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-5 py-2 text-white"
        >
          Send Message
        </button>
      </form>
    </div>
  )
}