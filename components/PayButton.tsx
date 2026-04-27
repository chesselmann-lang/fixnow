'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Euro, Lock } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm({ amount, onSuccess }: { amount: number; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const { error: submitErr } = await elements.submit()
    if (submitErr) { setError(submitErr.message ?? 'Fehler'); setLoading(false); return }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/customer/dashboard?payment=success`,
      },
    })
    if (confirmErr) { setError(confirmErr.message ?? 'Zahlung fehlgeschlagen'); setLoading(false) }
    else onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={!stripe || loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
        <Lock size={16} />
        {loading ? 'Zahlung läuft...' : `${amount.toFixed(2)} € jetzt bezahlen`}
      </button>
      <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
        <Lock size={10} /> Sichere Zahlung via Stripe · Escrow bis Auftrag abgeschlossen
      </p>
    </form>
  )
}

export default function PayButton({ offerId, amount, onSuccess }: {
  offerId: string
  amount: number
  onSuccess: () => void
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function initPayment() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setClientSecret(data.clientSecret)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Zahlung konnte nicht gestartet werden')
    } finally {
      setLoading(false)
    }
  }

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret, locale: 'de' }}>
        <CheckoutForm amount={amount} onSuccess={onSuccess} />
      </Elements>
    )
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button onClick={initPayment} disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
        <Euro size={16} />
        {loading ? 'Wird vorbereitet...' : `${amount.toFixed(2)} € bezahlen & Auftrag bestätigen`}
      </button>
    </div>
  )
}
