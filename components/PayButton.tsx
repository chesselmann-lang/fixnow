'use client'
import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

export default function PayButton({ offerId, price }: { offerId: string; price: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Fehler beim Starten der Zahlung')
      }
    } catch {
      setError('Netzwerkfehler')
    }
    setLoading(false)
  }

  return (
    <div>
      <button onClick={handlePay} disabled={loading}
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-50">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
        {loading ? 'Weiterleitung…' : `${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price / 100)} jetzt bezahlen`}
      </button>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  )
}
