import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

// POST /api/stripe/payment-intent
// Body: { offerId: string }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { offerId } = await req.json()

  // Fetch offer + provider stripe account
  const { data: offer, error: offerErr } = await supabase
    .from('offers')
    .select(`
      id, amount, request_id,
      provider:provider_profiles!offers_provider_id_fkey(stripe_account_id, business_name)
    `)
    .eq('id', offerId)
    .single()

  if (offerErr || !offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })

  const provider = offer.provider as { stripe_account_id: string; business_name: string } | null
  if (!provider?.stripe_account_id) {
    return NextResponse.json({ error: 'Provider has no Stripe account connected' }, { status: 400 })
  }

  const amountCents = Math.round(offer.amount * 100)
  // 10% platform fee for providers, 5% for loyal (simplified: always 10%)
  const platformFeeCents = Math.round(amountCents * 0.10)

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      payment_method_types: ['card', 'sepa_debit', 'klarna'],
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: provider.stripe_account_id,
      },
      metadata: {
        offer_id: offerId,
        request_id: String(offer.request_id),
        customer_id: user.id,
      },
      description: `supafix Auftrag #${offer.request_id} — ${provider.business_name}`,
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Payment intent creation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
