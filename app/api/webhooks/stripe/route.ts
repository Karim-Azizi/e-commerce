import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service role environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function getHeaderValue(value: string | string[] | null): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = getHeaderValue(headersList.get('stripe-signature'))

  if (!signature) {
    return new NextResponse('Missing stripe-signature header', { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Missing STRIPE_WEBHOOK_SECRET', { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    return new NextResponse(
      `Webhook signature verification failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      { status: 400 }
    )
  }

  const supabase = getAdminSupabase()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id
        const paymentId = session.metadata?.payment_id
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : null

        if (!orderId || !paymentId) {
          console.error('Missing order_id or payment_id in session metadata', {
            sessionId: session.id,
            metadata: session.metadata,
          })
          break
        }

        const paymentStatus = session.payment_status === 'paid' ? 'paid' : 'pending'
        const orderStatus = session.payment_status === 'paid' ? 'confirmed' : 'pending'

        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            status: paymentStatus,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
            method: 'stripe',
            currency: session.currency || 'usd',
          })
          .eq('id', paymentId)

        if (paymentError) {
          console.error('Failed to update payment on checkout.session.completed', paymentError)
          return new NextResponse('Failed to update payment', { status: 500 })
        }

        const { error: orderError } = await supabase
          .from('orders')
          .update({
            status: orderStatus,
          })
          .eq('id', orderId)

        if (orderError) {
          console.error('Failed to update order on checkout.session.completed', orderError)
          return new NextResponse('Failed to update order', { status: 500 })
        }

        break
      }

      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id
        const paymentId = session.metadata?.payment_id
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : null

        if (!orderId || !paymentId) {
          console.error('Missing order_id or payment_id in failed/expired session metadata', {
            sessionId: session.id,
            metadata: session.metadata,
          })
          break
        }

        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            status: 'failed',
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
            method: 'stripe',
            currency: session.currency || 'usd',
          })
          .eq('id', paymentId)

        if (paymentError) {
          console.error('Failed to update payment on failed/expired session', paymentError)
          return new NextResponse('Failed to update payment', { status: 500 })
        }

        const { error: orderError } = await supabase
          .from('orders')
          .update({
            status: 'pending',
          })
          .eq('id', orderId)

        if (orderError) {
          console.error('Failed to update order on failed/expired session', orderError)
          return new NextResponse('Failed to update order', { status: 500 })
        }

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            status: 'paid',
            stripe_payment_intent_id: paymentIntent.id,
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (paymentError) {
          console.error('Failed to update payment on payment_intent.succeeded', paymentError)
          return new NextResponse('Failed to update payment', { status: 500 })
        }

        const { data: paymentRow, error: paymentRowError } = await supabase
          .from('payments')
          .select('order_id')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .maybeSingle()

        if (paymentRowError) {
          console.error('Failed to fetch payment after payment_intent.succeeded', paymentRowError)
          return new NextResponse('Failed to fetch payment', { status: 500 })
        }

        if (paymentRow?.order_id) {
          const { error: orderError } = await supabase
            .from('orders')
            .update({
              status: 'confirmed',
            })
            .eq('id', paymentRow.order_id)

          if (orderError) {
            console.error('Failed to update order on payment_intent.succeeded', orderError)
            return new NextResponse('Failed to update order', { status: 500 })
          }
        }

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId =
          typeof charge.payment_intent === 'string' ? charge.payment_intent : null

        if (!paymentIntentId) break

        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            status: 'refunded',
          })
          .eq('stripe_payment_intent_id', paymentIntentId)

        if (paymentError) {
          console.error('Failed to update refunded payment', paymentError)
          return new NextResponse('Failed to update refunded payment', { status: 500 })
        }

        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Unexpected Stripe webhook error:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Webhook handler failed',
      { status: 500 }
    )
  }
}