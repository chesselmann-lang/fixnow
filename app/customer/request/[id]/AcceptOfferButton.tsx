'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2 } from 'lucide-react'

export default function AcceptOfferButton({ offerId, requestId }: { offerId: string; requestId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function accept() {
    setLoading(true)
    const supabase = createClient()
    // Angebot akzeptieren
    await supabase.from('offers').update({ status: 'accepted' }).eq('id', offerId)
    // Andere Angebote ablehnen
    await supabase.from('offers').update({ status: 'rejected' })
      .eq('request_id', requestId).neq('id', offerId)
    // Auftrag auf in_progress setzen
    await supabase.from('service_requests').update({ status: 'in_progress' }).eq('id', requestId)
    router.refresh()
  }

  return (
    <button
      onClick={accept}
      disabled={loading}
      className="mt-2 flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      <CheckCircle2 size={13} />
      {loading ? 'Wird akzeptiert…' : 'Annehmen'}
    </button>
  )
}
