import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' })

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/provider/dashboard?stripe_error=${error}`)
  }
  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/provider/dashboard?stripe_error=missing_params`)
  }

  const userId = Buffer.from(state, 'base64').toString('utf-8')

  try {
    // Exchange code for access token
    const response = await stripe.oauth.token({ grant_type: 'authorization_code', code })
    const stripeAccountId = response.stripe_user_id!

    // Save to provider_profiles
    const supabase = await createClient()
    await supabase
      .from('provider_profiles')
      .update({ stripe_account_id: stripeAccountId })
      .eq('user_id', userId)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/provider/dashboard?stripe_connected=1`)
  } catch (err) {
    console.error('Stripe Connect callback error:', err)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/provider/dashboard?stripe_error=exchange_failed`)
  }
}
