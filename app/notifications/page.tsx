import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell, ArrowLeft, CheckCheck } from 'lucide-react'
import MarkAllReadButton from './MarkAllReadButton'

const TYPE_ICONS: Record<string, string> = {
  new_offer: '💰',
  offer_accepted: '🎉',
  offer_rejected: '❌',
  new_message: '💬',
  booking_confirmed: '📅',
  booking_completed: '✅',
  payment_received: '💳',
  new_review: '⭐',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const backHref = profile?.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard'

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unreadIds = notifications?.filter(n => !n.read).map(n => n.id) ?? []

  // Alle als gelesen markieren beim Öffnen
  if (unreadIds.length > 0) {
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href={backHref} className="p-2 text-gray-400 hover:text-gray-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Benachrichtigungen</h1>
          </div>
          {notifications && notifications.length > 0 && (
            <MarkAllReadButton userId={user.id} />
          )}
        </div>

        {!notifications?.length ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Bell size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-600 mb-1">Keine Benachrichtigungen</p>
            <p className="text-gray-400 text-sm">Hier erscheinen neue Angebote, Nachrichten und Updates.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => (
              <Link
                key={notif.id}
                href={notif.link ?? '#'}
                className={`block bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow ${
                  !notif.read ? 'border-l-4 border-orange-400' : ''
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                    {TYPE_ICONS[notif.type] ?? '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>{notif.title}</p>
                    {notif.body && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{notif.body}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleString('de-DE', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0 mt-1.5" />}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
