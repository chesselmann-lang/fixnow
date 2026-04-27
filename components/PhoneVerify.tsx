'use client'
import { useState } from 'react'
import { Phone, ShieldCheck, Loader2 } from 'lucide-react'

interface Props {
  onVerified: (phone: string) => void
  defaultPhone?: string
}

export default function PhoneVerify({ onVerified, defaultPhone = '' }: Props) {
  const [phone, setPhone]     = useState(defaultPhone)
  const [code, setCode]       = useState('')
  const [step, setStep]       = useState<'phone' | 'code' | 'done'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function sendCode() {
    if (!phone.trim()) { setError('Bitte Telefonnummer eingeben'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/verify-phone/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim() }),
    })
    const data = await res.json() as { ok?: boolean; error?: string }
    setLoading(false)
    if (data.ok) setStep('code')
    else setError(data.error ?? 'SMS konnte nicht gesendet werden')
  }

  async function checkCode() {
    if (code.length < 4) { setError('Code eingeben'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/verify-phone/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim(), code }),
    })
    const data = await res.json() as { ok?: boolean; error?: string }
    setLoading(false)
    if (data.ok) { setStep('done'); onVerified(phone.trim()) }
    else setError(data.error ?? 'Code ungültig')
  }

  if (step === 'done') {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <ShieldCheck size={18} className="text-green-600" />
        <span className="text-green-700 font-semibold text-sm">Nummer verifiziert: {phone}</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {step === 'phone' && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Handynummer</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+49 151 12345678"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={sendCode}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 rounded-xl text-sm disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Phone size={14} />}
                SMS senden
              </button>
            </div>
          </div>
        </>
      )}

      {step === 'code' && (
        <>
          <p className="text-sm text-gray-600">
            Code gesendet an <strong>{phone}</strong>.{' '}
            <button type="button" onClick={() => setStep('phone')} className="text-orange-500 underline">Ändern</button>
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-stelliger Code"
              maxLength={6}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-center font-mono text-lg tracking-widest outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <button
              type="button"
              onClick={checkCode}
              disabled={loading || code.length < 4}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 rounded-xl text-sm disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              Bestätigen
            </button>
          </div>
        </>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
