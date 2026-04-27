'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

type Props = {
  offerId: string
  providerName: string
  onDone?: () => void
}

export default function ReviewPrompt({ offerId, providerName, onDone }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!rating) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, rating, comment }),
      })
      if (res.ok) { setDone(true); onDone?.() }
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
        <div className="text-2xl mb-1">🎉</div>
        <p className="text-green-700 font-semibold text-sm">Danke für deine Bewertung!</p>
        <p className="text-green-600 text-xs mt-0.5">Du hilfst anderen Kunden bei der Auswahl</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 mb-4">
      <p className="text-sm font-bold text-gray-800 mb-1">Wie war {providerName}?</p>
      <p className="text-xs text-gray-500 mb-4">Deine Bewertung hilft anderen Kunden</p>

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(n)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={28}
              className={`transition-colors ${n <= (hovered || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-200 fill-gray-200'}`}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Was hat dir besonders gut gefallen? (optional)"
            rows={3}
            className="w-full text-sm border border-orange-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white mb-3"
          />
          <button
            onClick={submit}
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            {submitting ? 'Wird gespeichert…' : 'Bewertung abschicken'}
          </button>
        </>
      )}
    </div>
  )
}
