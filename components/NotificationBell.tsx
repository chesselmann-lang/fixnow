'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'
import Link from 'next/link'

export default function NotificationBell({ userId }: { userId: string }) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    async function fetchUnread() {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
      setUnread(count ?? 0)
    }

    fetchUnread()

    const channel = supabase
      .channel(`notif-bell-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => fetchUnread())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return (
    <Link href="/notifications" className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg">
      <Bell size={20} />
      {unread > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}
