'use client'
import PhoneVerify from '@/components/PhoneVerify'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ChevronRight, ChevronLeft, CheckCircle, Wrench,
  Droplets, Zap, Hammer, KeyRound, PaintBucket, Truck,
  Leaf, Sparkles, Heart, Monitor, Car, Building2, MapPin,
  Shield, Star
} from 'lucide-react'

const CATEGORIES = [
  { id: 1,  name: 'Sanitär & Wasser',  icon: Droplets },
  { id: 2,  name: 'Elektrik',          icon: Zap },
  { id: 3,  name: 'Schreiner & Möbel', icon: Hammer },
  { id: 4,  name: 'Schlüsseldienst',   icon: KeyRound },
  { id: 5,  name: 'Maler & Tapete',    icon: PaintBucket },
  { id: 6,  name: 'Umzug & Transport', icon: Truck },
  { id: 7,  name: 'Garten & Pflege',   icon: Leaf },
  { id: 8,  name: 'Reinigung',         icon: Sparkles },
  { id: 11, name: 'Pflege & Betreuung',icon: Heart },
  { id: 12, name: 'IT & Technik',      icon: Monitor },
  { id: 13, name: 'Auto & KFZ',        icon: Car },
  { id: 10, name: 'Sonstiges',         icon: Wrench },
]

const RADIUS_OPTIONS = [5, 10, 25, 50, 100]

type Step = 1 | 2 | 3 | 4

export default function ProviderOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Firmendaten
  const [companyName, setCompanyName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [website, setWebsite] = useState('')

  // Step 2: Kategorien
  const [selectedCats, setSelectedCats] = useState<number[]>([])

  // Step 3: Standort + Radius
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [radiusKm, setRadiusKm] = useState(25)
  const [hourlyRateMin, setHourlyRateMin] = useState('')
  const [hourlyRateMax, setHourlyRateMax] = useState('')

  // Step 4: Bestätigung
  const [acceptTerms, setAcceptTerms] = useState(false)

  function toggleCat(id: number) {
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  async function finish() {
    if (!acceptTerms) { setError('Bitte AGB akzeptieren.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // Provider profile anlegen/updaten
    const { error: ppErr } = await supabase
      .from('provider_profiles')
      .upsert({
        id: user.id,
        bio: bio.trim() || null,
        website: website.trim() || null,
        radius_km: radiusKm,
        hourly_rate_min: hourlyRateMin ? Math.round(Number(hourlyRateMin) * 100) : null,
        hourly_rate_max: hourlyRateMax ? Math.round(Number(hourlyRateMax) * 100) : null,
        active: true,
        verified: false,
        verified_level: 1, // Email-verified
      })

    if (ppErr) { setError('Fehler beim Speichern. Bitte erneut versuchen.'); setLoading(false); return }

    // Profile update (phone, city, postal)
    await supabase.from('profiles').update({
      full_name: companyName || undefined,
      phone: phone.trim() || null,
      city: city.trim() || null,
      postal_code: postalCode.trim() || null,
    }).eq('id', user.id)

    // Kategorien
    if (selectedCats.length > 0) {
      await supabase.from('provider_categories').delete().eq('provider_id', user.id)
      await supabase.from('provider_categories').insert(
        selectedCats.map(cat_id => ({ provider_id: user.id, category_id: cat_id }))
      )
    }

    router.push('/provider/dashboard?onboarded=1')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/20 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <Wrench size={20} className="text-white" />
          </div>
          <span className="font-bold text-2xl text-gray-900">supa<span className="text-orange-500">fix</span></span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-1">Pro</span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1,2,3,4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s < step ? 'bg-orange-500 text-white' :
                s === step ? 'bg-orange-500 text-white ring-4 ring-orange-100' :
                'bg-gray-200 text-gray-400'
              }`}>
                {s < step ? <CheckCircle size={15} /> : s}
              </div>
              {s < 4 && <div className={`w-8 h-0.5 ${s < step ? 'bg-orange-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

          {/* ── Step 1: Firmendaten ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <Building2 size={24} className="text-orange-500" />
                <div>
                  <h2 className="font-black text-gray-900 text-xl">Firmendaten</h2>
                  <p className="text-gray-400 text-sm">Wie sollen Kunden dich kennenlernen?</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Firmen- / Dienstleistername *</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="z.B. Sanitär Müller GmbH"
                  className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kurzbeschreibung</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  placeholder="Was machst du? Besondere Stärken? Erfahrung in Jahren?"
                  className="w-full border border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon verifizieren</label>
                  <PhoneVerify defaultPhone={phone} onVerified={(p) => { setPhone(p); setPhoneVerified(true) }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Website (optional)</label>
                  <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!companyName.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors mt-4">
                Weiter <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── Step 2: Kategorien ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <Star size={24} className="text-orange-500" />
                <div>
                  <h2 className="font-black text-gray-900 text-xl">Deine Kategorien</h2>
                  <p className="text-gray-400 text-sm">Welche Arbeiten bietest du an? (Mehrfach möglich)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => toggleCat(cat.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all ${
                      selectedCats.includes(cat.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-100 hover:border-orange-200'
                    }`}>
                    <cat.icon size={18} className={selectedCats.includes(cat.id) ? 'text-orange-500' : 'text-gray-400'} />
                    <span className="text-sm font-medium text-gray-700 leading-tight">{cat.name}</span>
                    {selectedCats.includes(cat.id) && <CheckCircle size={14} className="text-orange-500 ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center">
                {selectedCats.length === 0 ? 'Bitte mindestens eine Kategorie wählen' : `${selectedCats.length} Kategorie${selectedCats.length > 1 ? 'n' : ''} ausgewählt`}
              </p>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 px-4 py-3">
                  <ChevronLeft size={16} /> Zurück
                </button>
                <button onClick={() => setStep(3)} disabled={selectedCats.length === 0}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors">
                  Weiter <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Standort + Radius + Stundensatz ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <MapPin size={24} className="text-orange-500" />
                <div>
                  <h2 className="font-black text-gray-900 text-xl">Einsatzgebiet</h2>
                  <p className="text-gray-400 text-sm">Wo arbeitest du? Wie weit fährst du?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">PLZ *</label>
                  <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)}
                    placeholder="46535" maxLength={5} inputMode="numeric"
                    className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stadt</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)}
                    placeholder="Dinslaken"
                    className="w-full border border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Aktionsradius: <span className="text-orange-500">{radiusKm} km</span></label>
                <div className="flex gap-2">
                  {RADIUS_OPTIONS.map(r => (
                    <button key={r} onClick={() => setRadiusKm(r)}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${
                        radiusKm === r ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}>
                      {r} km
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stundensatz (optional)</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={hourlyRateMin} onChange={e => setHourlyRateMin(e.target.value)}
                    placeholder="von €"
                    className="flex-1 border border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
                  <span className="text-gray-400">–</span>
                  <input type="number" value={hourlyRateMax} onChange={e => setHourlyRateMax(e.target.value)}
                    placeholder="bis €"
                    className="flex-1 border border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Richtwert für Kunden — verbindlicher Preis kommt im Angebot</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 px-4 py-3">
                  <ChevronLeft size={16} /> Zurück
                </button>
                <button onClick={() => setStep(4)} disabled={!postalCode.trim()}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors">
                  Weiter <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Bestätigung ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <Shield size={24} className="text-orange-500" />
                <div>
                  <h2 className="font-black text-gray-900 text-xl">Fast geschafft!</h2>
                  <p className="text-gray-400 text-sm">Profil bestätigen und starten</p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Firma/Name</span>
                  <span className="font-semibold text-gray-900">{companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Kategorien</span>
                  <span className="font-semibold text-gray-900">{selectedCats.length} ausgewählt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Einsatzgebiet</span>
                  <span className="font-semibold text-gray-900">{postalCode} · {radiusKm} km Radius</span>
                </div>
              </div>

              {/* Verifikations-Hinweis */}
              <div className="bg-blue-50 rounded-2xl p-4 flex items-start gap-3">
                <Shield size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-800 mb-1">Verifizierung erhöht deine Sichtbarkeit</p>
                  <p className="text-blue-600 text-xs">Nach der Registrierung kannst du Gewerbeschein + Haftpflichtversicherung hochladen für den „Verified"-Badge. Unverifizierte Accounts erhalten trotzdem Anfragen.</p>
                </div>
              </div>

              {/* AGB */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-orange-500" />
                <span className="text-sm text-gray-600">
                  Ich akzeptiere die{' '}
                  <a href="/agb" target="_blank" className="text-orange-500 hover:underline">AGB</a>{' '}
                  und{' '}
                  <a href="/datenschutz" target="_blank" className="text-orange-500 hover:underline">Datenschutzerklärung</a>
                  {' '}von supafix. Ich bestätige, dass ich gewerblich tätig bin.
                </span>
              </label>

              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 px-4 py-3">
                  <ChevronLeft size={16} /> Zurück
                </button>
                <button onClick={finish} disabled={!acceptTerms || loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors">
                  {loading ? 'Wird gespeichert...' : '🚀 Profil aktivieren'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
