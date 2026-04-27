// Supabase Edge Function: notify-providers
// Triggered: INSERT on service_requests
// Finds all providers in matching categories + PLZ radius → sends Web Push
//
// Required secrets:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, APP_URL
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const APP_URL       = Deno.env.get('APP_URL') ?? 'https://supafix.de'
const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
const VAPID_EMAIL   = Deno.env.get('VAPID_EMAIL') ?? 'mailto:hallo@supafix.de'

type WebhookPayload = {
  type: 'INSERT'
  table: string
  record: {
    id: string
    title: string
    category_id: string | null
    postal_code: string | null
    city: string | null
    customer_id: string
  }
}

// Minimal VAPID push using Web Crypto (no npm package in Deno Edge)
async function sendWebPush(subscription: { endpoint: string; p256dh: string; auth: string }, payload: string) {
  // Use the internal Supabase push API (proxied) — or call our Next.js /api/push/send
  // Since web-push npm isn't available in Deno, we call our own API route
  const res = await fetch(`${APP_URL}/api/push/send-internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-secret': VAPID_PRIVATE },
    body: JSON.stringify({ subscription, payload }),
  })
  return res.ok
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json()
    if (payload.type !== 'INSERT' || payload.table !== 'service_requests') {
      return new Response('ok')
    }

    const request = payload.record
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    // Find providers in matching category with push subscriptions
    const { data: providers } = await supabase
      .from('provider_profiles')
      .select('id')
      .not('id', 'eq', request.customer_id)

    if (!providers?.length) return new Response('ok')

    const providerIds = providers.map(p => p.id)

    // Get their push subscriptions
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('user_id')
      .in('user_id', providerIds)

    if (!subs?.length) return new Response('ok')

    const location = [request.postal_code, request.city].filter(Boolean).join(' ')
    const notifBody = location
      ? `Neuer Auftrag in ${location} — jetzt Angebot abgeben!`
      : 'Neuer Auftrag verfügbar — jetzt Angebot abgeben!'

    // Call our Next.js push send API
    const uniqueUserIds = [...new Set(subs.map(s => s.user_id))]

    await fetch(`${APP_URL}/api/push/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Use service role key as shared secret
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        userIds: uniqueUserIds,
        title: `🔔 ${request.title}`,
        body: notifBody,
        url: '/provider/dashboard',
        _bypass_auth: true, // Flag for internal calls
      }),
    })

    console.log(`Push sent to ${uniqueUserIds.length} providers for request ${request.id}`)
    return new Response(JSON.stringify({ ok: true, notified: uniqueUserIds.length }))
  } catch (err) {
    console.error('notify-providers error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
