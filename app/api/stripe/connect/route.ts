import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/stripe/connect — redirect provider to Stripe Connect OAuth
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID!
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/connect/callback`
  const state = Buffer.from(user.id).toString('base64')

  const url = new URL('https://connect.stripe.com/oauth/authorize')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('scope', 'read_write')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)
  url.searchParams.set('stripe_user[business_type]', 'individual')
  url.searchParams.set('stripe_user[country]', 'DE')
  url.searchParams.set('stripe_user[currency]', 'eur')
  url.searchParams.set('suggested_capabilities[]', 'transfers')

  return NextResponse.redirect(url.toString())
}
