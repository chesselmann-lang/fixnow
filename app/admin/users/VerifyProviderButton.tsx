'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

export default function VerifyProviderButton({ providerId }: { providerId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function verify() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('provider_profiles').update({ verified: true }).eq('id', providerId)
    router.refresh()
  }

  return (
    <button onClick={verify} disabled={loading}
      className="flex items-center gap-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded-lg transition-colors disabled:opacity-50">
      <ShieldCheck size={12} />
      {loading ? '…' : 'Verifizieren'}
    </button>
  )
}
