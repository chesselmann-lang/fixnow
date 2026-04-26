'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, Send, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
  bookingId: string
  providerId: string
  providerName: string
}

export default function ReviewForm({ bookingId, providerId, providerName }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('reviews').insert({
      booking_id: bookingId,
      reviewer_id: user!.id,
      provider_id: providerId,
      rating,
      comment: comment.trim() || null,
    })

    // Buchung als abgeschlossen markieren
    await supabase.from('bookings').update({ customer_rating: rating }).eq('id', bookingId)

    setSubmitted(true)
    setLoading(false)
    router.refresh()
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
        <div className="text-2xl mb-2">⭐</div>
        <p className="font-semibold text-green-700">Bewertung abgegeben!</p>
        <p className="text-green-600 text-sm mt-1">Danke für dein Feedback zu {providerName}.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-1">Wie war {providerName}?</h3>
      <p className="text-gray-500 text-sm mb-4">Deine Bewertung hilft anderen Kunden.</p>

      <form onSubmit={submit} className="space-y-4">
        {/* Sterne */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={`${(hovered || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} transition-colors`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-sm text-gray-500">
            {['', 'Sehr schlecht', 'Schlecht', 'In Ordnung', 'Gut', 'Ausgezeichnet!'][rating]}
          </p>
        )}

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder="Optionaler Kommentar…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />

        <button
          type="submit"
          disabled={rating === 0 || loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Bewertung abgeben
        </button>
      </form>
    </div>
  )
}
