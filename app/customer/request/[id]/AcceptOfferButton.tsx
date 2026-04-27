'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Euro, X } from 'lucide-react'
import PayButton from '@/components/PayButton'

interface Props {
  offerId: string
  requestId: string
  amount: number // in Euro (not cents)
  providerName: string
}

export default function AcceptOfferButton({ offerId, requestId, amount, providerName }: Props) {
  const [showPayment, setShowPayment] = useState(false)
  const router = useRouter()

  function onSuccess() {
    router.refresh()
    router.push(`/customer/dashboard?payment=success`)
  }

  if (showPayment) {
    return (
      <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-gray-900 text-sm">Angebot von {providerName} bestätigen</p>
          <button onClick={() => setShowPayment(false)} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Mit der Zahlung wird der Betrag sicher einbehalten (Escrow) und erst nach Auftragsabschluss
          an {providerName} ausgezahlt.
        </p>
        <PayButton offerId={offerId} amount={amount} onSuccess={onSuccess} />
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowPayment(true)}
      className="mt-2 flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
    >
      <CheckCircle2 size={13} />
      Akzeptieren &amp; bezahlen — {amount.toFixed(2)} €
    </button>
  )
}
