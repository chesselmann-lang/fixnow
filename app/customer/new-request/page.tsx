'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Camera, X, Loader2, ChevronRight, Droplets, Zap, Hammer, KeyRound, PaintBucket, Truck, Leaf, Sparkles, Wrench, Wand2 } from 'lucide-react'

const CATEGORIES = [
  { id: 1, slug: 'sanitaer',  name: 'Sanitär',    icon: Droplets },
  { id: 2, slug: 'elektro',   name: 'Elektrik',   icon: Zap },
  { id: 3, slug: 'schreiner', name: 'Schreiner',  icon: Hammer },
  { id: 4, slug: 'schloss',   name: 'Schlüssel',  icon: KeyRound },
  { id: 5, slug: 'maler',     name: 'Maler',      icon: PaintBucket },
  { id: 6, slug: 'umzug',     name: 'Umzug',      icon: Truck },
  { id: 7, slug: 'garten',    name: 'Garten',     icon: Leaf },
  { id: 8, slug: 'reinigung', name: 'Reinigung',  icon: Sparkles },
  { id: 10, slug: 'sonstiges',name: 'Sonstiges',  icon: Wrench },
]

const URGENCY = [
  { value: 'asap',   label: '🚨 Sofort – Notfall' },
  { value: 'today',  label: '⚡ Heute noch' },
  { value: 'week',   label: '📅 Diese Woche' },
  { value: 'normal', label: '🗓️ Kein Eildruck' },
]

export default function NewRequestPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState('normal')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  function handleFiles(files: FileList | null) {
    if (!files) return
    const arr = Array.from(files).slice(0, 5)
    const newPhotos = [...photos, ...arr].slice(0, 5)
    setPhotos(newPhotos)
    arr.forEach(f => {
      const reader = new FileReader()
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string].slice(0, 5))
      reader.readAsDataURL(f)
    })
  }

  function removePhoto(i: number) {
    setPhotos(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  async function analyzeWithAI() {
    if (photos.length === 0 && !description) return
    setAnalyzing(true)
    try {
      const fd = new FormData()
      if (photos[0]) fd.append('image', photos[0])
      fd.append('description', description)

      const res = await fetch('/api/analyze-image', { method: 'POST', body: fd })
      const result = await res.json()

      if (result.category_id) setCategoryId(result.category_id)
      if (result.title && !title) setTitle(result.title)
      if (result.description && !description) setDescription(result.description)
      if (result.urgency) setUrgency(result.urgency)
    } catch (_) {
      // Fehler bei KI ignorieren, User kann manuell weiter
    }
    setAnalyzing(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryId) { setError('Bitte wähle eine Kategorie.'); return }
    if (!title.trim()) { setError('Bitte beschreibe das Problem kurz.'); return }

    setLoading(true)
    setError('')
    const supabase = createClient()

    const photoUrls: string[] = []
    for (const photo of photos) {
      const ext = photo.name.split('.').pop()
      const path = `requests/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('request-photos')
        .upload(path, photo)
      if (!uploadErr) {
        const { data } = supabase.storage.from('request-photos').getPublicUrl(path)
        photoUrls.push(data.publicUrl)
      }
    }

    const { data: req, error: insertErr } = await supabase
      .from('service_requests')
      .insert({
        category_id: categoryId,
        title: title.trim(),
        description: description.trim(),
        urgency,
        city: city.trim(),
        postal_code: postalCode.trim(),
        photos: photoUrls,
      })
      .select('id')
      .single()

    if (insertErr) {
      setError('Fehler beim Erstellen. Bitte versuche es erneut.')
      setLoading(false)
      return
    }

    router.push(`/customer/request/${req.id}`)
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${step >= s ? 'bg-orange-500' : 'bg-gray-200'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Schritt 1: Foto + KI-Analyse */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Zeig uns das Problem</h1>
              <p className="text-gray-500 text-sm">Foto machen – unsere KI analysiert es automatisch</p>
            </div>

            {/* Foto-Upload */}
            <div>
              <div className="flex gap-3 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-24 h-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
                    <button type="button" onClick={() => removePhoto(i)}
                      className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {previews.length < 5 && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors">
                    <Camera size={22} />
                    <span className="text-xs">Foto</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" multiple capture="environment"
                  className="hidden" onChange={e => handleFiles(e.target.files)} />
              </div>
            </div>

            {/* Kurzbeschreibung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Was ist das Problem?</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder="z.B. Wasserhahn tropft, Fenster schließt nicht mehr…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>

            {/* KI-Analyse Button */}
            {(photos.length > 0 || description) && (
              <button type="button" onClick={analyzeWithAI} disabled={analyzing}
                className="w-full border-2 border-orange-300 text-orange-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors disabled:opacity-50">
                {analyzing ? <><Loader2 size={18} className="animate-spin" /> KI analysiert…</> : <><Wand2 size={18} /> Mit KI analysieren</>}
              </button>
            )}

            <button type="button" onClick={() => setStep(2)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              Weiter <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Schritt 2: Kategorie & Details */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Details</h1>
              <p className="text-gray-500 text-sm mb-4">Kategorie und Beschreibung prüfen / anpassen</p>
            </div>

            {/* Kategorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie *</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      categoryId === cat.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-orange-200'
                    }`}>
                    <cat.icon size={18} className={categoryId === cat.id ? 'text-orange-500' : 'text-gray-400'} />
                    <span className="text-xs font-medium text-center leading-tight text-gray-700">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Titel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kurztitel *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="z.B. Wasserhahn tropft im Badezimmer"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
            </div>

            {/* Beschreibung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                placeholder="Beschreibe das Problem so genau wie möglich…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>

            {/* Dringlichkeit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dringlichkeit</label>
              <div className="grid grid-cols-2 gap-2">
                {URGENCY.map(u => (
                  <button key={u.value} type="button" onClick={() => setUrgency(u.value)}
                    className={`text-sm px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                      urgency === u.value ? 'border-orange-500 bg-orange-50 font-medium' : 'border-gray-100 bg-white'
                    }`}>
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => setStep(3)} disabled={!title.trim() || !categoryId}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors">
              Weiter <ChevronRight size={18} />
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">← Zurück</button>
          </div>
        )}

        {/* Schritt 3: Standort */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Wo bist du?</h1>
              <p className="text-gray-500 text-sm mb-5">Damit lokale Dienstleister dich finden</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
                <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)}
                  placeholder="12345"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)}
                  placeholder="Musterstadt"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>

            {/* Zusammenfassung */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Zusammenfassung</h3>
              <p className="text-sm text-gray-600"><span className="font-medium">Titel:</span> {title}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Kategorie:</span> {CATEGORIES.find(c => c.id === categoryId)?.name}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Dringlichkeit:</span> {URGENCY.find(u => u.value === urgency)?.label}</p>
              {photos.length > 0 && <p className="text-sm text-gray-600"><span className="font-medium">Fotos:</span> {photos.length}</p>}
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-base">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Auftrag wird erstellt…</> : '🚀 Auftrag veröffentlichen'}
            </button>
            <button type="button" onClick={() => setStep(2)} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">← Zurück</button>
          </div>
        )}
      </form>
    </div>
  )
}
