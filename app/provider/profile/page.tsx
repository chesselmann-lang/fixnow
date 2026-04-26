'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, CheckCircle } from 'lucide-react'

const CATEGORIES = [
  { id: 1, name: 'Sanitär & Wasser' },
  { id: 2, name: 'Elektrik' },
  { id: 3, name: 'Schreiner & Möbel' },
  { id: 4, name: 'Schlüssel & Schloss' },
  { id: 5, name: 'Maler & Tapete' },
  { id: 6, name: 'Umzug & Transport' },
  { id: 7, name: 'Garten & Pflege' },
  { id: 8, name: 'Reinigung' },
  { id: 10, name: 'Sonstiges' },
]

export default function ProviderProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [bio, setBio] = useState('')
  const [radiusKm, setRadiusKm] = useState(20)
  const [rateMin, setRateMin] = useState('')
  const [rateMax, setRateMax] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, city')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setPhone(profile.phone || '')
        setCity(profile.city || '')
      }

      const { data: pp } = await supabase
        .from('provider_profiles')
        .select('*, categories:provider_categories(category_id)')
        .eq('id', user.id)
        .single()

      if (pp) {
        setBio(pp.bio || '')
        setRadiusKm(pp.radius_km || 20)
        setRateMin(pp.hourly_rate_min ? String(pp.hourly_rate_min / 100) : '')
        setRateMax(pp.hourly_rate_max ? String(pp.hourly_rate_max / 100) : '')
        setSelectedCategories(pp.categories?.map((c: { category_id: number }) => c.category_id) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  function toggleCategory(id: number) {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Profil updaten
    await supabase.from('profiles').update({
      full_name: fullName,
      phone: phone || null,
      city: city || null,
    }).eq('id', user.id)

    // Provider-Profil upserten
    await supabase.from('provider_profiles').upsert({
      id: user.id,
      bio: bio || null,
      radius_km: radiusKm,
      hourly_rate_min: rateMin ? Math.round(Number(rateMin) * 100) : null,
      hourly_rate_max: rateMax ? Math.round(Number(rateMax) * 100) : null,
    })

    // Kategorien aktualisieren
    await supabase.from('provider_categories').delete().eq('provider_id', user.id)
    if (selectedCategories.length > 0) {
      await supabase.from('provider_categories').insert(
        selectedCategories.map(catId => ({ provider_id: user.id, category_id: catId }))
      )
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="animate-spin text-orange-500" size={28} />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Mein Profil</h1>
      <p className="text-gray-500 text-sm mb-6">Daten, die Kunden über dich sehen</p>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basis */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Persönliche Angaben</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+49 123 456789"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stadt / Region</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)}
                placeholder="München"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
        </div>

        {/* Dienstleister-Infos */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Über mich</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kurzbeschreibung</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              placeholder="Kurz vorstellen: Erfahrung, Stärken, besondere Leistungen…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stundensatz ab (€)</label>
              <input type="number" min="0" value={rateMin} onChange={e => setRateMin(e.target.value)}
                placeholder="45"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stundensatz bis (€)</label>
              <input type="number" min="0" value={rateMax} onChange={e => setRateMax(e.target.value)}
                placeholder="90"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Radius (km)</label>
              <input type="number" min="1" max="200" value={radiusKm} onChange={e => setRadiusKm(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
        </div>

        {/* Kategorien */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Meine Fachbereiche</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`text-sm px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                  selectedCategories.includes(cat.id)
                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                    : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
          {saving ? (
            <><Loader2 size={18} className="animate-spin" /> Wird gespeichert…</>
          ) : saved ? (
            <><CheckCircle size={18} /> Gespeichert!</>
          ) : (
            <><Save size={16} /> Profil speichern</>
          )}
        </button>
      </form>
    </div>
  )
}
