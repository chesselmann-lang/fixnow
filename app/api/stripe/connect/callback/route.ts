import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const base = process.env.NEXT_PUBLIC_SITE_URL!

  if (error) {
    return NextResponse.redirect(`${base}/provider/dashboard?stripe_error=${error}`)
  }
  if (!code || !state) {
    return NextResponse.redirect(`${base}/provider/dashboard?stripe_error=missing_params`)
  }

  const userId = Buffer.from(state, 'base64').toString('utf-8')

  try {
    // Exchange authorization code for access token via Stripe REST API
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
    })

    const tokenRes = await fetch('https://connect.stripe.com/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.json() as { error_description?: string }
      console.error('Stripe token exchange failed:', err)
      return NextResponse.redirect(`${base}/provider/dashboard?stripe_error=exchange_failed`)
    }

    const data = await tokenRes.json() as { stripe_user_id?: string }
    const stripeAccountId = data.stripe_user_id

    if (!stripeAccountId) {
      return NextResponse.redirect(`${base}/provider/dashboard?stripe_error=no_account_id`)
    }

    // Save to provider_profiles
    const supabase = await createClient()
    await supabase
      .from('provider_profiles')
      .update({ stripe_account_id: stripeAccountId })
      .eq('user_id', userId)

    return NextResponse.redirect(`${base}/provider/dashboard?stripe_connected=1`)
  } catch (err) {
    console.error('Stripe Connect callback error:', err)
    return NextResponse.redirect(`${base}/provider/dashboard?stripe_error=server_error`)
  }
}
