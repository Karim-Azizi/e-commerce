'use client'
import { useState } from 'react'
import { createPublicClient } from '@/lib/supabase/client'

export default function ContactForm() {
  const supabase = createPublicClient()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name')
    const email = formData.get('email')
    const message = formData.get('message')

    const { error } = await supabase.from('inquiries').insert({
      name,
      email,
      message,
    })

    setLoading(false)

    if (error) {
      alert('Failed to send message.')
    } else {
      alert('Message sent successfully!')
      e.currentTarget.reset()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" placeholder="Your Name" required className="input" />
      <input name="email" type="email" placeholder="Your Email" required className="input" />
      <textarea name="message" placeholder="Your Message" required className="input" />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}