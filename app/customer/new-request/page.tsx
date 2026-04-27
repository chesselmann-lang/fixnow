'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Mic, MicOff, Camera, X, Loader2, ChevronRight, ChevronLeft,
  Droplets, Zap, Hammer, KeyRound, PaintBucket, Truck, Leaf,
  Sparkles, Wrench, Wand2, MapPin, Clock, Euro, CheckCircle,
  Heart, Monitor, Car
} from 'lucide-react'

const CATEGORIES = [
  { id: 1,  name: 'Sanitär',     icon: Droplets,    color: 'blue' },
  { id: 2,  name: 'Elektrik',    icon: Zap,         color: 'yellow' },
  { id: 3,  name: 'Schreiner',   icon: Hammer,      color: 'amber' },
  { id: 4,  name: 'Schlüssel',   icon: KeyRound,    color: 'gray' },
  { id: 5,  name: 'Maler',       icon: PaintBucket, color: 'purple' },
  { id: 6,  name: 'Umzug',       icon: Truck,       color: 'green' },
  { id: 7,  name: 'Garten',      icon: Leaf,        color: 'emerald' },
  { id: 8,  name: 'Reinigung',   icon: Sparkles,    color: 'sky' },
  { id: 11, name: 'Pflege',      icon: Heart,       color: 'rose' },
  { id: 12, name: 'IT & Technik',icon: Monitor,     color: 'indigo' },
  { id: 13, name: 'Auto & KFZ',  icon: Car,         color: 'slate' },
  { id: 10, name: 'Sonstiges',   icon: Wrench,      color: 'gray' },
]

const URGENCY = [
  { value: 'asap',   label: '🚨 Sofort – Notfall',      sub: 'Innerhalb von Stunden' },
  { value: 'today',  label: '⚡ Heute noch',              sub: 'Noch am selben Tag' },
  { value: 'week',   label: '📅 Diese Woche',            sub: 'In den nächsten 7 Tagen' },
  { value: 'normal', label: '🗓️ Kein Zeitdruck',         sub: 'Flexibel planbar' },
]

type Step = 1 | 2 | 3 | 4 | 5

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => i + 1).map(s => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            s < current ? 'bg-orange-500 text-white' :
            s === current ? 'bg-orange-500 text-white ring-4 ring-orange-100' :
            'bg-gray-100 text-gray-400'
          }`}>
            {s < current ? <CheckCircle size={16} /> : s}
          </div>
          {s < total && <div className={`flex-1 h-0.5 w-8 ${s < current ? 'bg-orange-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  )
}

export default function NewRequestPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [step, setStep] = useState<Step>(1)

  // Step 1: Input
  const [inputMode, setInputMode] = useState<'text' | 'voice' | 'photo'>('text')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [voiceTranscript, setVoiceTranscript] = useState('')

  // Step 2: KI-Analyse
  const [analyzing, setAnalyzing] = useState(false)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [aiSource, setAiSource] = useState<string>('manual')

  // Step 3: Location
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')

  // Step 4: Urgency
  const [urgency, setUrgency] = useState('normal')

  // Global
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Voice Recording ──────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        // Transcribe
        setAnalyzing(true)
        try {
          const fd = new FormData()
          fd.append('audio', blob, 'recording.webm')
          const res = await fetch('/api/transcribe', { method: 'POST', body: fd })
          const data = await res.json()
          if (data.text) {
            setVoiceTranscript(data.text)
            setDescription(data.text)
          }
        } catch { /* ignore, user can type */ }
        setAnalyzing(false)
      }
      mediaRef.current = mr
      mr.start()
      setRecording(true)
    } catch {
      setError('Mikrofon-Zugriff verweigert. Bitte in Browser-Einstellungen erlauben.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop()
    setRecording(false)
  }, [])

  // ── Photo Handling ────────────────────────────────────────
  function handleFiles(files: FileList | null) {
    if (!files) return
    const arr = Array.from(files).slice(0, 5 - photos.length)
    setPhotos(prev => [...prev, ...arr].slice(0, 5))
    arr.forEach(f => {
      const reader = new FileReader()
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string].slice(0, 5))
      reader.readAsDataURL(f)
    })
  }

  // ── KI Analyse ───────────────────────────────────────────
  async function runAI() {
    if (!description && photos.length === 0) return
    setAnalyzing(true)
    try {
      const fd = new FormData()
      if (photos[0]) fd.append('image', photos[0])
      fd.append('description', description)
      const res = await fetch('/api/analyze-image', { method: 'POST', body: fd })
      const result = await res.json()
      if (result.category_id) setCategoryId(result.category_id)
      if (result.title && !title) setTitle(result.title)
      if (!description && result.description) setDescription(result.description)
      setAiSource(result.source ?? 'text')

      // Budget-Schätzung
      const budRes = await fetch('/api/estimate-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: result.category_id ?? categoryId, title: result.title ?? title, description })
      })
      const budData = await budRes.json()
      if (budData.min) setBudgetMin(String(budData.min))
      if (budData.max) setBudgetMax(String(budData.max))
    } catch { /* ignore */ }
    setAnalyzing(false)
  }

  // ── Submit ────────────────────────────────────────────────
  async function handleSubmit() {
    if (!categoryId || !title.trim()) { setError('Kategorie und Titel erforderlich.'); return }
    if (!postalCode.trim()) { setError('PLZ ist erforderlich.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()

    // Upload photos
    const photoUrls: string[] = []
    for (const photo of photos) {
      const ext = photo.name.split('.').pop()
      const path = `requests/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('request-photos').upload(path, photo)
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
        address: address.trim() || null,
        photos: photoUrls,
        budget_estimate_min: budgetMin ? Math.round(Number(budgetMin) * 100) : null,
        budget_estimate_max: budgetMax ? Math.round(Number(budgetMax) * 100) : null,
        ai_source: aiSource,
      })
      .select('id')
      .single()

    if (insertErr) {
      setError('Fehler beim Erstellen. Bitte erneut versuchen.')
      setLoading(false)
      return
    }
    router.push(`/customer/request/${req.id}?new=1`)
  }

  const canProceedStep1 = description.trim().length > 3 || photos.length > 0
  const canProceedStep2 = !!categoryId && title.trim().length > 2
  const canProceedStep3 = postalCode.trim().length >= 4

  return (
    <div className="max-w-lg mx-auto py-4">
      <StepIndicator current={step} total={5} />

      {/* ── Step 1: Input ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Was ist das Problem?</h1>
            <p className="text-gray-500 text-sm">Sprechen, tippen oder Foto — wie du magst</p>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {([['text', 'Tippen'], ['voice', 'Sprechen'], ['photo', 'Foto']] as const).map(([mode, label]) => (
              <button key={mode} onClick={() => setInputMode(mode)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${inputMode === mode ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Text Mode */}
          {inputMode === 'text' && (
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              autoFocus
              placeholder="z.B. Wasserhahn tropft seit gestern. Im Badezimmer, kaltes Wasser. Hahn ist ca. 10 Jahre alt..."
              className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-2xl px-4 py-3 text-sm outline-none resize-none transition-colors leading-relaxed"
            />
          )}

          {/* Voice Mode */}
          {inputMode === 'voice' && (
            <div className="text-center space-y-4 py-4">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all shadow-lg ${
                  recording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}>
                {recording ? <MicOff size={36} className="text-white" /> : <Mic size={36} className="text-white" />}
              </button>
              <p className="text-sm text-gray-500">
                {recording ? '🔴 Aufnahme läuft — jetzt sprechen...' :
                 analyzing ? '🧠 Sprache wird analysiert...' :
                 voiceTranscript ? '✅ Erkannt — weiter bearbeiten' :
                 'Auf Mikrofon tippen und Anliegen beschreiben'}
              </p>
              {(voiceTranscript || analyzing) && (
                <div className="bg-gray-50 rounded-xl p-4 text-left">
                  {analyzing ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Loader2 size={16} className="animate-spin" /> Wird transkribiert...
                    </div>
                  ) : (
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                      className="w-full text-sm text-gray-700 bg-transparent outline-none resize-none" />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Photo Mode */}
          {inputMode === 'photo' && (
            <div className="space-y-3">
              <div className="flex gap-3 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-24 h-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
                    <button type="button" onClick={() => {
                      setPhotos(p => p.filter((_, idx) => idx !== i))
                      setPreviews(p => p.filter((_, idx) => idx !== i))
                    }} className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {previews.length < 5 && (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors">
                    <Camera size={22} />
                    <span className="text-xs">Foto</span>
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple capture="environment"
                className="hidden" onChange={e => handleFiles(e.target.files)} />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Optional: kurz beschreiben was zu sehen ist..."
                className="w-full border border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors"
              />
            </div>
          )}

          <button
            onClick={() => { runAI(); setStep(2) }}
            disabled={!canProceedStep1}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors">
            <Wand2 size={18} />
            KI analysiert & weiter
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ── Step 2: KI-Ergebnis + Kategorie ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Kategorie & Details</h1>
            <p className="text-gray-500 text-sm">KI-Vorschlag prüfen und anpassen</p>
          </div>

          {analyzing && (
            <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-orange-500" />
              <span className="text-sm text-orange-700 font-medium">KI analysiert dein Anliegen...</span>
            </div>
          )}

          {/* Kategorie-Grid */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kategorie *</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-center ${
                    categoryId === cat.id
                      ? 'border-orange-500 bg-orange-50 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-orange-200'
                  }`}>
                  <cat.icon size={18} className={categoryId === cat.id ? 'text-orange-500' : 'text-gray-400'} />
                  <span className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Titel */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Kurztitel *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="z.B. Wasserhahn tropft im Badezimmer"
              className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
          </div>

          {/* Budget-Schätzung */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Budget-Schätzung (optional)
              {budgetMin && <span className="ml-2 text-xs text-orange-500 font-normal">✨ KI-Schätzung</span>}
            </label>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Euro size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)}
                  placeholder="von"
                  className="w-full border border-gray-200 focus:border-orange-400 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none" />
              </div>
              <span className="text-gray-400 text-sm">–</span>
              <div className="relative flex-1">
                <Euro size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)}
                  placeholder="bis"
                  className="w-full border border-gray-200 focus:border-orange-400 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Hilft Dienstleistern ein passendes Angebot zu machen</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 px-4 py-3">
              <ChevronLeft size={16} /> Zurück
            </button>
            <button onClick={() => setStep(3)} disabled={!canProceedStep2}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors">
              Weiter <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Location ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Wo bist du?</h1>
            <p className="text-gray-500 text-sm">Damit Dienstleister in deiner Nähe benachrichtigt werden</p>
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
                className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Straße (optional)</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Musterstraße 12"
              className="w-full border border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
            <p className="text-xs text-gray-400 mt-1">Nur für den beauftragten Dienstleister sichtbar</p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 flex items-start gap-3">
            <MapPin size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">Wir benachrichtigen automatisch die 5 besten Dienstleister in deiner Region.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 px-4 py-3">
              <ChevronLeft size={16} /> Zurück
            </button>
            <button onClick={() => setStep(4)} disabled={!canProceedStep3}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors">
              Weiter <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Urgency ── */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Wie dringend?</h1>
            <p className="text-gray-500 text-sm">Beeinflusst welche Dienstleister zuerst benachrichtigt werden</p>
          </div>

          <div className="space-y-3">
            {URGENCY.map(u => (
              <button key={u.value} onClick={() => setUrgency(u.value)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                  urgency === u.value ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-orange-200'
                }`}>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{u.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{u.sub}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  urgency === u.value ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                }`}>
                  {urgency === u.value && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 px-4 py-3">
              <ChevronLeft size={16} /> Zurück
            </button>
            <button onClick={() => setStep(5)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors">
              Vorschau <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 5: Preview + Publish ── */}
      {step === 5 && (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Alles korrekt?</h1>
            <p className="text-gray-500 text-sm">Prüfe deine Anfrage vor der Veröffentlichung</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {previews.length > 0 && (
              <div className="flex gap-2 p-3 bg-gray-50 border-b border-gray-100">
                {previews.slice(0, 3).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" className="w-16 h-16 rounded-lg object-cover" />
                ))}
              </div>
            )}
            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {CATEGORIES.find(c => c.id === categoryId)?.name}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin size={14} className="text-orange-400" />
                  {postalCode} {city}
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock size={14} className="text-orange-400" />
                  {URGENCY.find(u => u.value === urgency)?.label.split(' ').slice(1).join(' ')}
                </div>
                {(budgetMin || budgetMax) && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Euro size={14} className="text-orange-400" />
                    {budgetMin}–{budgetMax} €
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">Sofort nach Veröffentlichung</p>
              <p className="text-xs text-green-600 mt-0.5">Die besten 5 Dienstleister in deiner Region werden automatisch benachrichtigt.</p>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

          <div className="flex gap-3">
            <button onClick={() => setStep(4)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 px-4 py-3">
              <ChevronLeft size={16} /> Zurück
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-base shadow-lg shadow-orange-200">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Wird veröffentlicht...</> : '🚀 Jetzt veröffentlichen'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
