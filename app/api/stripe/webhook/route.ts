import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

  if (!STRIPE_SECRET || !WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  // Stripe-Signatur verifizieren
  let event: { type: string; data: { object: Record<string, unknown> } }
  try {
    const { createHmac } = await import('crypto')
    const parts = signature.split(',')
    const timestamp = parts.find(p => p.startsWith('t='))?.slice(2)
    const v1 = parts.find(p => p.startsWith('v1='))?.slice(3)
    const expectedSig = createHmac('sha256', WEBHOOK_SECRET)
      .update(`${timestamp}.${body}`)
      .digest('hex')
    if (expectedSig !== v1) throw new Error('Invalid signature')
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Record<string, unknown>
      const piId = pi.id as string

      // Payment als succeeded markieren
      await supabase
        .from('payments')
        .update({ status: 'succeeded', paid_at: new Date().toISOString() })
        .eq('stripe_payment_intent_id', piId)

      // Buchung anlegen
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('stripe_payment_intent_id', piId)
        .single()

      if (payment) {
        // Offer suchen
        const { data: offer } = await supabase
          .from('offers')
          .select('id, request_id')
          .eq('provider_id', payment.provider_id)
          .eq('status', 'accepted')
          .single()

        if (offer) {
          const { data: booking } = await supabase
            .from('bookings')
            .insert({ offer_id: offer.id, status: 'scheduled' })
            .select('id')
            .single()

          if (booking) {
            await supabase.from('payments').update({ booking_id: booking.id }).eq('id', payment.id)
          }

          // Benachrichtigung an Provider
          await supabase.from('notifications').insert({
            user_id: payment.provider_id,
            type: 'payment_received',
            title: 'Zahlung eingegangen! 💳',
            body: 'Der Kunde hat bezahlt. Der Auftrag kann beginnen.',
            link: `/provider/request/${offer.request_id}`,
          })
        }
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Record<string, unknown>
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent_id', pi.id as string)
      break
    }
  }

  return NextResponse.json({ received: true })
}
