import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  // Service-role Supabase client (bypasses RLS)
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs: { name: string; value: string; options: CookieOptions }[]) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const offerId = pi.metadata.offer_id
      const requestId = pi.metadata.request_id

      // Mark offer as paid, request as accepted
      await Promise.all([
        supabase.from('offers').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', offerId),
        supabase.from('service_requests').update({ status: 'accepted', accepted_offer_id: offerId }).eq('id', requestId),
      ])
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.error('Payment failed for offer', pi.metadata.offer_id, pi.last_payment_error?.message)
      break
    }

    case 'account.updated': {
      // Provider completed onboarding
      const account = event.data.object as Stripe.Account
      if (account.charges_enabled) {
        await supabase
          .from('provider_profiles')
          .update({ stripe_verified: true })
          .eq('stripe_account_id', account.id)
      }
      break
    }

    default:
      // Unhandled event type — ignore
  }

  return NextResponse.json({ received: true })
}

