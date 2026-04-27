'use client'
import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'

interface Coords { lat: number; lng: number; place: string }

export default function MapPreview({ plz, city, className = '' }: {
  plz: string
  city?: string
  className?: string
}) {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!plz || plz.length < 4) { setCoords(null); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const q = city ? `${plz} ${city}` : plz
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
        if (res.ok) {
          const data = await res.json() as Coords
          setCoords(data)
        }
      } finally {
        setLoading(false)
      }
    }, 600) // debounce
    return () => clearTimeout(t)
  }, [plz, city])

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-2xl flex items-center justify-center ${className}`} style={{ height: 180 }}>
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!coords) return null

  // Mapbox Static Images API — no JS SDK needed
  const mapUrl = token && token !== 'PLACEHOLDER_SET_IN_VERCEL'
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s-wrench+f97316(${coords.lng},${coords.lat})/${coords.lng},${coords.lat},13,0/600x200@2x?access_token=${token}`
    : `https://staticmap.openstreetmap.de/staticmap.php?center=${coords.lat},${coords.lng}&zoom=13&size=600x200&markers=${coords.lat},${coords.lng},red-pushpin`

  return (
    <div className={`rounded-2xl overflow-hidden border border-gray-200 relative ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mapUrl}
        alt={`Karte für ${coords.place}`}
        className="w-full object-cover"
        style={{ height: 180 }}
      />
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
        <MapPin size={13} className="text-orange-500" />
        <span className="text-xs font-semibold text-gray-800">{coords.place.split(',')[0]}</span>
      </div>
    </div>
  )
}
