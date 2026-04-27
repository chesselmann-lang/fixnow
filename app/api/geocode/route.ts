import { NextRequest, NextResponse } from 'next/server'

// GET /api/geocode?q=45147+Essen
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token || token === 'PLACEHOLDER_SET_IN_VERCEL') {
    // Return mock coordinates for Essen (fallback when token not set)
    return NextResponse.json({ lat: 51.4556, lng: 7.0116, place: q })
  }

  const url = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(q + ', Deutschland') + '.json')
  url.searchParams.set('access_token', token)
  url.searchParams.set('country', 'DE')
  url.searchParams.set('types', 'postcode,place')
  url.searchParams.set('limit', '1')

  const res = await fetch(url.toString())
  if (!res.ok) return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })

  const data = await res.json() as { features?: Array<{ center: [number, number]; place_name: string }> }
  const feature = data.features?.[0]
  if (!feature) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    lng: feature.center[0],
    lat: feature.center[1],
    place: feature.place_name,
  })
}
