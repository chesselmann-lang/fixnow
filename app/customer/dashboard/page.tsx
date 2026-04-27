import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle, Clock, CheckCircle, MessageSquare, ChevronRight, MapPin, Star } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  open:        { label: 'Offen',          color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400' },
  in_progress: { label: 'In Bearbeitung', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  completed:   { label: 'Abgeschlossen',  color: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
  cancelled:   { label: 'Storniert',      color: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-300' },
}

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  // Requests with offer counts
  const { data: requests } = await supabase
    .from('service_requests')
    .select('*, category:categories(name, icon), offers(id, status, price)')
    .eq('customer_id', user!.id)
    .order('created_at', { ascending: false })

  const open    = requests?.filter(r => r.status === 'open').length ?? 0
  const active  = requests?.filter(r => r.status === 'in_progress').length ?? 0
  const done    = requests?.filter(r => r.status === 'completed').length ?? 0

  const firstName = profile?.full_name?.split(' ')[0] ?? 'dort'

  return (
    <div>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hallo, {firstName} 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">Hier sind deine Aufträge im Überblick</p>
      </div>

      {/* CTA — new request prominent */}
      <Link
        href="/customer/new-request"
        className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-5 py-4 rounded-2xl mb-6 shadow-md shadow-orange-200 transition-all group"
      >
        <div>
          <p className="text-base font-bold">Neuen Auftrag erstellen</p>
          <p className="text-orange-100 text-xs mt-0.5">Kostenlos & in 60 Sekunden</p>
        </div>
        <PlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Clock,         value: open,   label: 'Offen',    color: 'text-blue-500',   bg: 'bg-blue-50' },
          { icon: MessageSquare, value: active, label: 'Aktiv',    color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: CheckCircle,   value: done,   label: 'Erledigt', color: 'text-green-500',  bg: 'bg-green-50' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4`}>
            <stat.icon size={18} className={stat.color} />
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
          <p className="text-gray-400 text-sm mb-6">Erstelle deinen ersten Auftrag – in 60 Sekunden!</p>
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
          <h2 className="text-base font-semibold text-gray-700">Deine Aufträge</h2>
          {requests.map(req => {
            const s = STATUS_LABELS[req.status] ?? STATUS_LABELS.open
            const allOffers = (req.offers ?? []) as { id: string; status: string; price: number }[]
            const offerCount = allOffers.filter(o => o.status !== 'withdrawn').length
            const acceptedOffer = allOffers.find(o => o.status === 'accepted')
            const bestPrice = offerCount > 0
              ? Math.min(...allOffers.filter(o => o.status !== 'withdrawn').map(o => o.price))
              : null

            return (
              <Link key={req.id} href={`/customer/request/${req.id}`}>
                <div className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all hover:-translate-y-0.5 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Category + status row */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                      {req.category && (
                        <span className="text-xs text-gray-400">{(req.category as { name: string }).name}</span>
                      )}
                    </div>

                    <p className="font-semibold text-gray-900 text-sm truncate">{req.title}</p>

                    <div className="flex items-center gap-3 mt-1.5">
                      {(req.city || req.postal_code) && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400">
                          <MapPin size={10} />
                          {[req.postal_code, req.city].filter(Boolean).join(' ')}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(req.created_at).toLocaleDateString('de-DE')}
                      </span>
                    </div>

                    {/* Offer count / accepted indicator */}
                    {offerCount > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        {acceptedOffer ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle size={12} />
                            Angebot akzeptiert
                            {acceptedOffer.price && (
                              <span className="text-gray-500 font-normal">
                                · {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(acceptedOffer.price / 100)}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                            <Star size={12} className="fill-orange-400 text-orange-400" />
                            {offerCount} {offerCount === 1 ? 'Angebot' : 'Angebote'}
                            {bestPrice && (
                              <span className="text-gray-500 font-normal">
                                · ab {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(bestPrice / 100)}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-gray-300 shrink-0 mt-1" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
