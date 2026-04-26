import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle, Clock, CheckCircle, MessageSquare, ChevronRight } from 'lucide-react'
import type { ServiceRequest } from '@/lib/types'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open:        { label: 'Offen',        color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Bearbeitung', color: 'bg-orange-100 text-orange-700' },
  completed:   { label: 'Abgeschlossen', color: 'bg-green-100 text-green-700' },
  cancelled:   { label: 'Storniert',    color: 'bg-gray-100 text-gray-500' },
}

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: requests } = await supabase
    .from('service_requests')
    .select('*, category:categories(name, icon)')
    .eq('customer_id', user!.id)
    .order('created_at', { ascending: false })

  const open = requests?.filter(r => r.status === 'open').length ?? 0
  const active = requests?.filter(r => r.status === 'in_progress').length ?? 0
  const done = requests?.filter(r => r.status === 'completed').length ?? 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meine Aufträge</h1>
          <p className="text-gray-500 text-sm mt-0.5">Übersicht aller deiner Anfragen</p>
        </div>
        <Link
          href="/customer/new-request"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <PlusCircle size={16} />
          Neuer Auftrag
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Clock, value: open, label: 'Offen', color: 'text-blue-500' },
          { icon: MessageSquare, value: active, label: 'Aktiv', color: 'text-orange-500' },
          { icon: CheckCircle, value: done, label: 'Erledigt', color: 'text-green-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm">
            <stat.icon size={20} className={stat.color} />
            <div className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Auftragliste */}
      {!requests?.length ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <PlusCircle size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">Noch keine Aufträge</h3>
          <p className="text-gray-400 text-sm mb-6">Erstelle deinen ersten Auftrag – in 30 Sekunden!</p>
          <Link
            href="/customer/new-request"
            className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-orange-600 transition-colors"
          >
            <PlusCircle size={16} />
            Ersten Auftrag erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(requests as ServiceRequest[]).map(req => {
            const s = STATUS_LABELS[req.status]
            return (
              <Link key={req.id} href={`/customer/request/${req.id}`}>
                <div className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                      {req.offer_count > 0 && (
                        <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                          {req.offer_count} Angebot{req.offer_count > 1 ? 'e' : ''}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 truncate">{req.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(req.created_at).toLocaleDateString('de-DE')}
                      {req.city && ` · ${req.city}`}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 ml-3 flex-shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
