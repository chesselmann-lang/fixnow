'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCheck } from 'lucide-react'

export default function MarkAllReadButton({ userId }: { userId: string }) {
  const router = useRouter()
  async function markAll() {
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    router.refresh()
  }
  return (
    <button onClick={markAll} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
      <CheckCheck size={14} /> Alle gelesen
    </button>
  )
}
