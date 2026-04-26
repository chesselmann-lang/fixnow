import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, Clock, MapPin, Tag, TrendingUp } from 'lucide-react'
import type { ServiceRequest } from '@/lib/types'

const URGENCY_COLORS: Record<string, string> = {
  asap:   'bg-red-100 text-red-600',
  today:  'bg-orange-100 text-orange-600',
  week:   'bg-yellow-100 text-yellow-700',
  normal: 'bg-gray-100 text-gray-500',
}
const URGENCY_LABELS: Record<string, string> = {
  asap:   '🚨 Sofort',
  today:  '⚡ Heute',
  week:   '📅 Diese Woche',
  normal: '🗓️ Kein Eildruck',
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default async function ProviderDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Provider-Profil laden (Kategorien)
  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select('*, categories:provider_categories(category_id)')
    .eq('id', user!.id)
    .single()

  // Offene Aufträge (eigene Kategorie oder alle, wenn noch keine Kategorien)
  let query = supabase
    .from('service_requests')
    .select('*, category:categories(name, icon)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(50)

  const catIds = providerProfile?.categories?.map((c: { category_id: number }) => c.category_id) ?? []
  if (catIds.length > 0) {
    query = query.in('category_id', catIds)
  }

  const { data: requests } = await query

  // Meine abgegebenen Angebote
  const { data: myOffers } = await supabase
    .from('offers')
    .select('request_id, status')
    .eq('provider_id', user!.id)

  const myOfferRequestIds = new Set(myOffers?.map(o => o.request_id) ?? [])
  const acceptedCount = myOffers?.filter(o => o.status === 'accepted').length ?? 0

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offene Aufträge</h1>
          <p className="text-gray-500 text-sm mt-0.5">Aktuelle Anfragen in deiner Region</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Neue Aufträge', value: requests?.length ?? 0, icon: Clock, color: 'text-blue-500' },
          { label: 'Meine Angebote', value: myOffers?.length ?? 0, icon: Tag, color: 'text-orange-500' },
          { label: 'Aufträge gewonnen', value: acceptedCount, icon: TrendingUp, color: 'text-green-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
            <s.icon size={20} className={s.color} />
            <div className="text-2xl font-bold text-gray-900 mt-2">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Profil-Hinweis wenn nicht eingerichtet */}
      {!providerProfile && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-orange-700 text-sm">Profil noch nicht eingerichtet</p>
            <p className="text-orange-500 text-xs mt-0.5">Richte dein Profil ein, um bessere Aufträge zu finden.</p>
          </div>
          <Link href="/provider/profile" className="bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
            Einrichten
          </Link>
        </div>
      )}

      {/* Auftragsliste */}
      {!requests?.length ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
          <Clock size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600 mb-1">Keine offenen Aufträge</p>
          <p className="text-gray-400 text-sm">Aktuell gibt es keine Aufträge in deinen Kategorien.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(requests as ServiceRequest[]).map(req => {
            const alreadyOffered = myOfferRequestIds.has(req.id)
            return (
              <Link key={req.id} href={`/provider/request/${req.id}`}>
                <div className={`bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center justify-between ${alreadyOffered ? 'opacity-60' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${URGENCY_COLORS[req.urgency]}`}>
                        {URGENCY_LABELS[req.urgency]}
                      </span>
                      {req.category && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{req.category.name}</span>
                      )}
                      {alreadyOffered && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Angebot abgegeben</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 truncate">{req.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      {(req.city || req.postal_code) && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {[req.postal_code, req.city].filter(Boolean).join(' ')}
                        </span>
                      )}
                      <span>{req.offer_count} Angebot{req.offer_count !== 1 ? 'e' : ''}</span>
                      <span>{new Date(req.created_at).toLocaleDateString('de-DE')}</span>
                    </div>
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
