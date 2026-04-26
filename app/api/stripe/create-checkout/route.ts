import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { offerId } = await request.json()

  // Angebot + Request laden
  const { data: offer } = await supabase
    .from('offers')
    .select('*, request:service_requests(title, customer_id), provider:profiles!provider_profiles_id_fkey(full_name)')
    .eq('id', offerId)
    .eq('status', 'accepted')
    .single()

  if (!offer || offer.request.customer_id !== user.id) {
    return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 })
  }

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY
  if (!STRIPE_SECRET) {
    return NextResponse.json({ error: 'Stripe nicht konfiguriert' }, { status: 503 })
  }

  // Platform Fee: 10%
  const platformFee = Math.round(offer.price * 0.1)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][unit_amount]': String(offer.price),
        'line_items[0][price_data][product_data][name]': offer.request.title,
        'line_items[0][price_data][product_data][description]': `Dienstleistung von ${offer.provider?.full_name}`,
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'success_url': `${siteUrl}/customer/request/${offer.request_id}?payment=success`,
        'cancel_url': `${siteUrl}/customer/request/${offer.request_id}?payment=cancelled`,
        'metadata[offer_id]': offerId,
        'metadata[customer_id]': user.id,
        'metadata[provider_id]': offer.provider_id,
        'payment_intent_data[application_fee_amount]': String(platformFee),
      }).toString(),
    })

    const session = await response.json()

    if (!response.ok) {
      throw new Error(session.error?.message ?? 'Stripe-Fehler')
    }

    // Payment in DB anlegen
    await supabase.from('payments').insert({
      customer_id: user.id,
      provider_id: offer.provider_id,
      stripe_payment_intent_id: session.payment_intent,
      amount: offer.price,
      platform_fee: platformFee,
      status: 'pending',
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
