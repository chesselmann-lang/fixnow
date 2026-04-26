import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CATEGORIES = [
  { id: 1, slug: 'sanitaer',      name: 'Sanitär & Wasser',   keywords: ['wasser', 'hahn', 'rohr', 'toilette', 'heizung', 'dusche', 'bad', 'abfluss'] },
  { id: 2, slug: 'elektro',       name: 'Elektrik',            keywords: ['strom', 'steckdose', 'sicherung', 'kabel', 'licht', 'lampe', 'schalter'] },
  { id: 3, slug: 'schreiner',     name: 'Schreiner & Möbel',   keywords: ['tür', 'fenster', 'holz', 'möbel', 'schrank', 'boden', 'parkett', 'scharnier'] },
  { id: 4, slug: 'schloss',       name: 'Schlüssel & Schloss', keywords: ['schloss', 'schlüssel', 'tür', 'einbruch', 'eingesperrt', 'aussperrung'] },
  { id: 5, slug: 'maler',         name: 'Maler & Tapete',      keywords: ['farbe', 'wand', 'tapete', 'streichen', 'fleck', 'riss', 'schimmel'] },
  { id: 6, slug: 'umzug',         name: 'Umzug & Transport',   keywords: ['umzug', 'transport', 'möbel', 'tragen', 'kiste'] },
  { id: 7, slug: 'garten',        name: 'Garten & Pflege',     keywords: ['garten', 'rasen', 'hecke', 'baum', 'pflaster', 'terrasse'] },
  { id: 8, slug: 'reinigung',     name: 'Reinigung',           keywords: ['reinigung', 'putzen', 'sauber', 'fenster', 'teppich'] },
  { id: 10, slug: 'sonstiges',    name: 'Sonstiges',           keywords: [] },
]

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const imageFile = formData.get('image') as File | null
  const userDescription = formData.get('description') as string | ''

  if (!imageFile) {
    return NextResponse.json({ error: 'Kein Bild übergeben' }, { status: 400 })
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    // Fallback: nur Textanalyse
    return analyzeTextOnly(userDescription)
  }

  try {
    // Bild zu Base64
    const bytes = await imageFile.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = imageFile.type || 'image/jpeg'

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 400,
        messages: [
          {
            role: 'system',
            content: `Du bist ein Assistent für einen Heimdienstleistungs-Marktplatz.
Analysiere das Bild und den Text.
Antworte NUR mit einem JSON-Objekt (kein Markdown) mit diesen Feldern:
{
  "category_id": <1-10, passende Kategorie>,
  "title": "<kurzer präziser Titel, max 60 Zeichen>",
  "description": "<Problembeschreibung, max 200 Zeichen>",
  "urgency": "<asap|today|week|normal>",
  "confidence": <0.0-1.0>
}

Kategorien: 1=Sanitär, 2=Elektrik, 3=Schreiner/Möbel, 4=Schlüssel/Schloss, 5=Maler, 6=Umzug, 7=Garten, 8=Reinigung, 10=Sonstiges`,
          },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'low' } },
              { type: 'text', text: userDescription ? `Zusatzinfo vom Nutzer: ${userDescription}` : 'Analysiere das Bild.' },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      return analyzeTextOnly(userDescription)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content)

    return NextResponse.json({
      category_id: parsed.category_id ?? 10,
      title: parsed.title ?? '',
      description: parsed.description ?? '',
      urgency: parsed.urgency ?? 'normal',
      confidence: parsed.confidence ?? 0.8,
      source: 'vision',
    })
  } catch (err) {
    console.error('Vision API error:', err)
    return analyzeTextOnly(userDescription)
  }
}

function analyzeTextOnly(text: string): NextResponse {
  if (!text) {
    return NextResponse.json({ category_id: 10, title: '', description: '', urgency: 'normal', confidence: 0, source: 'none' })
  }

  const lower = text.toLowerCase()
  let bestCat = CATEGORIES[CATEGORIES.length - 1]
  let bestScore = 0

  for (const cat of CATEGORIES) {
    const score = cat.keywords.filter(k => lower.includes(k)).length
    if (score > bestScore) { bestScore = score; bestCat = cat }
  }

  // Dringlichkeit aus Text ableiten
  let urgency = 'normal'
  if (/sofort|notfall|dringend|jetzt|heute|sofortig/.test(lower)) urgency = 'asap'
  else if (/heute|baldmöglich|schnell/.test(lower)) urgency = 'today'
  else if (/diese woche|woche/.test(lower)) urgency = 'week'

  return NextResponse.json({
    category_id: bestCat.id,
    title: '',
    description: '',
    urgency,
    confidence: bestScore > 0 ? 0.6 : 0.2,
    source: 'text',
  })
}
