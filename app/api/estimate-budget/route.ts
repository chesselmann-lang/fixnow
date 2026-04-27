import { NextRequest, NextResponse } from 'next/server'

// Grobe Markt-Richtwerte für DACH-Region (in Euro)
const BUDGET_ESTIMATES: Record<number, { min: number; max: number; label: string }> = {
  1:  { min: 80,  max: 350, label: 'Sanitär' },
  2:  { min: 60,  max: 280, label: 'Elektrik' },
  3:  { min: 100, max: 500, label: 'Schreiner' },
  4:  { min: 80,  max: 200, label: 'Schlüsseldienst' },
  5:  { min: 150, max: 800, label: 'Maler' },
  6:  { min: 200, max: 1200, label: 'Umzug' },
  7:  { min: 60,  max: 400, label: 'Garten' },
  8:  { min: 80,  max: 300, label: 'Reinigung' },
  11: { min: 20,  max: 30,  label: 'Pflege (€/h)' },
  12: { min: 50,  max: 180, label: 'IT & Technik' },
  13: { min: 60,  max: 400, label: 'Auto & KFZ' },
  10: { min: 50,  max: 300, label: 'Sonstiges' },
}

export async function POST(request: NextRequest) {
  const { category_id, title, description } = await request.json()

  const base = BUDGET_ESTIMATES[category_id] ?? { min: 50, max: 300 }

  // Urgency keywords → Aufschlag
  const text = ((title ?? '') + ' ' + (description ?? '')).toLowerCase()
  let multiplier = 1.0
  if (/notfall|sofort|dringend|ausgesperrt|überschwemmung|kurzschluss/.test(text)) multiplier = 1.4
  else if (/groß|komplett|alle|gesamt/.test(text)) multiplier = 1.3

  return NextResponse.json({
    min: Math.round(base.min * multiplier),
    max: Math.round(base.max * multiplier),
    label: base.label,
    note: 'Richtwert · Endpreis nach Angeboten',
  })
}
