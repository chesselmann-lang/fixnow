import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

const VAPID_PUBLIC  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY  ?? ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? ''
const VAPID_EMAIL   = 'mailto:hallo@supafix.de'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const body_raw = await req.json() as {
      userIds: string[]
      title: string
      body: string
      url?: string
      _bypass_auth?: boolean
    }

    // Allow internal calls from Edge Functions with service role key
    const authHeader = req.headers.get('Authorization') ?? ''
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    const isInternal = body_raw._bypass_auth && serviceKey && authHeader === `Bearer ${serviceKey}`

    if (!isInternal) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userIds, title, body, url } = body_raw as {
      userIds: string[]
      title: string
      body: string
      url?: string
    }

    if (!userIds?.length || !title || !body) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      console.log('[mock push]', title, body, 'to', userIds.length, 'users')
      return NextResponse.json({ ok: true, mock: true })
    }

    // Get subscriptions for target users
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth, user_id')
      .in('user_id', userIds)

    if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 })

    const payload = JSON.stringify({ title, body, url: url ?? '/', icon: '/icon-192.png' })
    const staleEndpoints: string[] = []

    await Promise.allSettled(
      subs.map(async sub => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
        } catch (err: unknown) {
          // 410 Gone = subscription expired → clean up
          if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
            staleEndpoints.push(sub.endpoint)
          }
        }
      })
    )

    // Remove stale subscriptions
    if (staleEndpoints.length) {
      await supabase.from('push_subscriptions').delete().in('endpoint', staleEndpoints)
    }

    return NextResponse.json({ ok: true, sent: subs.length - staleEndpoints.length })
  } catch (e) {
    console.error('push send error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
