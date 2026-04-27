// Supabase Edge Function: send-notification
// Triggered via DB webhook on:
//   - INSERT on offers → notify customer (new offer received)
//   - UPDATE on offers WHERE status = 'accepted' → notify provider (offer accepted)
// Requires env: RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, APP_URL

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY') ?? ''
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const APP_URL          = Deno.env.get('APP_URL') ?? 'https://supafix.de'
const FROM_EMAIL       = 'supafix <noreply@supafix.de>'

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: Record<string, unknown>
  old_record?: Record<string, unknown>
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log('[mock] Would send email to', to, '—', subject)
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
  }
}

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f8f8; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,.06); }
  .header { background: linear-gradient(135deg, #f97316, #fb923c); padding: 32px 32px 24px; }
  .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 800; }
  .header p { color: rgba(255,255,255,.85); margin: 6px 0 0; font-size: 14px; }
  .body { padding: 32px; }
  .body p { color: #444; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
  .cta { display: inline-block; background: #f97316; color: #fff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 12px; margin: 8px 0 24px; }
  .card { background: #fff8f5; border: 1px solid #fed7aa; border-radius: 12px; padding: 16px 20px; margin: 16px 0; }
  .card .label { font-size: 11px; color: #9a3412; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; }
  .card .value { font-size: 16px; color: #1c1917; font-weight: 600; }
  .footer { padding: 20px 32px; background: #fafafa; border-top: 1px solid #f0f0f0; }
  .footer p { color: #999; font-size: 12px; margin: 0; line-height: 1.5; }
</style>
</head>
<body>
${content}
</body>
</html>`
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json()
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    // ── INSERT on offers → notify CUSTOMER of new offer ──
    if (payload.type === 'INSERT' && payload.table === 'offers') {
      const offer = payload.record
      const requestId = offer.request_id as string
      const providerId = offer.provider_id as string
      const price = offer.price as number

      // Get request + customer email
      const { data: request } = await supabase
        .from('service_requests')
        .select('title, customer_id')
        .eq('id', requestId)
        .single()

      if (!request) return new Response('ok')

      const { data: customerProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', request.customer_id)
        .single()

      const { data: providerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', providerId)
        .single()

      if (!customerProfile?.email) return new Response('ok')

      const priceStr = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price / 100)
      const link = `${APP_URL}/customer/request/${requestId}`

      await sendEmail(
        customerProfile.email,
        `Neues Angebot für "${request.title}" — ${priceStr}`,
        emailWrapper(`
<div class="container">
  <div class="header">
    <h1>Neues Angebot erhalten 🎉</h1>
    <p>Jemand möchte deinen Auftrag übernehmen</p>
  </div>
  <div class="body">
    <p>Hallo ${customerProfile.full_name?.split(' ')[0] ?? 'dort'},</p>
    <p><strong>${providerProfile?.full_name ?? 'Ein Dienstleister'}</strong> hat ein Angebot für deinen Auftrag abgegeben:</p>
    <div class="card">
      <div class="label">Auftrag</div>
      <div class="value">${request.title}</div>
    </div>
    <div class="card">
      <div class="label">Angebotspreis</div>
      <div class="value">${priceStr}</div>
    </div>
    <p>Prüfe das Angebot und akzeptiere es, wenn es passt — die Zahlung wird sicher hinterlegt bis der Job erledigt ist.</p>
    <a href="${link}" class="cta">Angebot ansehen →</a>
    <p style="font-size:13px;color:#999;">Schnell sein lohnt sich — beliebte Dienstleister sind oft ausgebucht!</p>
  </div>
  <div class="footer">
    <p>supafix · Der Marktplatz für Handwerker & Dienstleister im DACH-Raum<br>
    Du erhältst diese E-Mail, weil du einen Auftrag auf supafix.de erstellt hast.</p>
  </div>
</div>`)
      )
    }

    // ── UPDATE on offers WHERE status = 'accepted' → notify PROVIDER ──
    if (payload.type === 'UPDATE' && payload.table === 'offers') {
      const newOffer = payload.record
      const oldOffer = payload.old_record

      if (newOffer.status === 'accepted' && oldOffer?.status !== 'accepted') {
        const requestId = newOffer.request_id as string
        const providerId = newOffer.provider_id as string
        const price = newOffer.price as number

        const { data: request } = await supabase
          .from('service_requests')
          .select('title, city, postal_code')
          .eq('id', requestId)
          .single()

        const { data: provProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', providerId)
          .single()

        if (!provProfile?.email || !request) return new Response('ok')

        const priceNet = Math.round(price * 0.9)
        const priceStr = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(priceNet / 100)
        const location = [request.postal_code, request.city].filter(Boolean).join(' ')
        const link = `${APP_URL}/provider/dashboard`

        await sendEmail(
          provProfile.email,
          `✅ Dein Angebot wurde akzeptiert — ${priceStr} warten!`,
          emailWrapper(`
<div class="container">
  <div class="header">
    <h1>Glückwunsch! 🎉</h1>
    <p>Dein Angebot wurde akzeptiert</p>
  </div>
  <div class="body">
    <p>Hallo ${provProfile.full_name?.split(' ')[0] ?? 'dort'},</p>
    <p>Der Kunde hat dein Angebot angenommen. Der Betrag ist sicher hinterlegt und wird nach Abschluss ausgezahlt.</p>
    <div class="card">
      <div class="label">Auftrag</div>
      <div class="value">${request.title}</div>
    </div>
    ${location ? `<div class="card"><div class="label">Standort</div><div class="value">${location}</div></div>` : ''}
    <div class="card">
      <div class="label">Dein Verdienst (nach Gebühr)</div>
      <div class="value">${priceStr}</div>
    </div>
    <p>Kontaktiere den Kunden über den integrierten Chat und vereinbare einen Termin.</p>
    <a href="${link}" class="cta">Zum Dashboard →</a>
  </div>
  <div class="footer">
    <p>supafix · Der Marktplatz für Handwerker & Dienstleister im DACH-Raum<br>
    Du erhältst diese E-Mail als registrierter Dienstleister auf supafix.de.</p>
  </div>
</div>`)
        )
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('send-notification error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
