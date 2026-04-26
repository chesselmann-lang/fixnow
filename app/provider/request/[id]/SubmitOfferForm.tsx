'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Euro, Loader2, Send } from 'lucide-react'

export default function SubmitOfferForm({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')
  const [availableFrom, setAvailableFrom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError('Bitte gib einen gültigen Preis ein.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: insertErr } = await supabase.from('offers').insert({
      request_id: requestId,
      price: Math.round(Number(price) * 100),  // in Cent
      message: message.trim() || null,
      available_from: availableFrom || null,
    })

    if (insertErr) {
      setError('Fehler beim Absenden. Bitte erneut versuchen.')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Angebot abgeben</h2>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}

      <form onSubmit={submit} className="space-y-4">
        {/* Preis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dein Preis (€) *</label>
          <div className="relative">
            <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              min="1"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
              placeholder="z.B. 85.00"
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Gesamtpreis für den Auftrag (inkl. Material & Arbeit)</p>
        </div>

        {/* Nachricht */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nachricht an den Kunden</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            placeholder="Kurze Vorstellung und was im Preis enthalten ist…"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>

        {/* Verfügbar ab */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Frühestmöglich verfügbar ab</label>
          <input
            type="datetime-local"
            value={availableFrom}
            onChange={e => setAvailableFrom(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Wird gesendet…</>
          ) : (
            <><Send size={16} /> Angebot absenden</>
          )}
        </button>
      </form>
    </div>
  )
}
