'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CloseRequestButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handle() {
    if (!confirm('Auftrag als "Abgeschlossen" markieren?')) return
    setLoading(true)
    try {
      await fetch(`/api/admin/close-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      <CheckCircle2 size={13} />
      {loading ? '…' : 'Abschließen'}
    </button>
  )
}
