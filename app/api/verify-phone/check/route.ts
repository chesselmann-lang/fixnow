import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/verify-phone/check — verify OTP code
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone, code } = await req.json()
  if (!phone || !code) return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

  if (!accountSid || !authToken || !serviceSid) {
    // Mock: any 6-digit code is valid if Twilio not configured
    if (/^\d{6}$/.test(code)) {
      await supabase.from('profiles').update({ phone_verified: true, phone }).eq('id', user.id)
      return NextResponse.json({ ok: true, mock: true })
    }
    return NextResponse.json({ error: 'Ungültiger Code' }, { status: 400 })
  }

  const params = new URLSearchParams({ To: phone, Code: code })
  const res = await fetch(
    `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }
  )

  const data = await res.json() as { status?: string; message?: string }

  if (!res.ok || data.status !== 'approved') {
    return NextResponse.json({ error: data.message ?? 'Code ungültig oder abgelaufen' }, { status: 400 })
  }

  // Mark phone as verified in DB
  await supabase.from('profiles').update({ phone_verified: true, phone }).eq('id', user.id)

  return NextResponse.json({ ok: true })
}
