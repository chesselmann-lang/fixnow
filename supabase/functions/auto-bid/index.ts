// supafix Auto-Bid-Bot — Hesselmann als First-Provider
// Wird via Supabase DB Webhook getriggert wenn neue service_request erstellt wird

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const HESSELMANN_PROVIDER_ID = Deno.env.get('HESSELMANN_PROVIDER_ID') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Kategorien die Hesselmann bedient
const HESSELMANN_CATEGORIES = [1, 2, 7, 8, 9, 11] // Sanitär, Elektrik, Garten, Reinigung, Hauswirtschaft, Pflege

// PLZ-Präfixe die Hesselmann bedient (Dinslaken, Duisburg, Teile Düsseldorf)
const HESSELMANN_PLZ_PREFIXES = ['464', '465', '466', '474', '475', '476', '400', '401', '402', '403', '404', '405', '406', '407', '408', '409']

// Preis-Matrix (in Euro-Cent) pro Kategorie
const PRICE_MATRIX: Record<number, { base: number; label: string }> = {
  1:  { base: 9900,  label: 'Sanitär-Erstbesichtigung inkl. Kleinreparatur' },
  2:  { base: 8900,  label: 'Elektrik-Erstcheck inkl. Kleinreparatur' },
  7:  { base: 7500,  label: 'Gartenarbeit (2h Basis)' },
  8:  { base: 6500,  label: 'Reinigung (2h Standard)' },
  9:  { base: 5500,  label: 'Hauswirtschaft (2h)' },
  11: { base: 5000,  label: 'Haushaltshilfe (2h)' },
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record

    if (!record || record.status !== 'open') {
      return new Response(JSON.stringify({ skipped: 'not open' }), { status: 200 })
    }

    const { id: requestId, category_id, postal_code, urgency } = record

    // Kategorie-Check
    if (!HESSELMANN_CATEGORIES.includes(category_id)) {
      return new Response(JSON.stringify({ skipped: 'category not served' }), { status: 200 })
    }

    // PLZ-Check
    const plzPrefix = (postal_code ?? '').substring(0, 3)
    if (!HESSELMANN_PLZ_PREFIXES.includes(plzPrefix)) {
      return new Response(JSON.stringify({ skipped: 'outside radius' }), { status: 200 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Prüfen ob Hesselmann schon ein Angebot für diesen Request hat
    const { data: existing } = await supabase
      .from('offers')
      .select('id')
      .eq('request_id', requestId)
      .eq('provider_id', HESSELMANN_PROVIDER_ID)
      .single()

    if (existing) {
      return new Response(JSON.stringify({ skipped: 'already bid' }), { status: 200 })
    }

    // Preis berechnen
    const priceConfig = PRICE_MATRIX[category_id] ?? { base: 8900, label: 'Dienstleistung' }
    let price = priceConfig.base

    // Notfall-Aufschlag
    if (urgency === 'asap') price = Math.round(price * 1.5)
    else if (urgency === 'today') price = Math.round(price * 1.2)

    // ETA berechnen
    const etaHours = urgency === 'asap' ? 2 : urgency === 'today' ? 6 : 24

    const message = `Hallo! Ich bin Hesselmann Beratung aus Dinslaken — Ihr lokaler Ansprechpartner seit Jahren.

✅ Verfügbar ${urgency === 'asap' ? 'innerhalb von 2 Stunden' : urgency === 'today' ? 'noch heute' : 'zeitnah'}
✅ Verifizierter Betrieb mit Haftpflicht
✅ Faire Festpreise, keine versteckten Kosten

Der Preis versteht sich als Pauschalpreis für die Standardleistung. Bei größerem Aufwand sprechen wir vorher.`

    const { error: insertErr } = await supabase
      .from('offers')
      .insert({
        request_id: requestId,
        provider_id: HESSELMANN_PROVIDER_ID,
        price,
        message,
        eta_hours: etaHours,
        status: 'pending',
      })

    if (insertErr) throw insertErr

    return new Response(JSON.stringify({
      success: true,
      requestId,
      price,
      etaHours,
    }), { status: 200 })

  } catch (err) {
    console.error('Auto-bid error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
