import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MapPin, Clock, Euro, Star, Zap, ChevronRight, Bell, CheckCircle, AlertCircle, CreditCard } from 'lucide-react'

const URGENCY_CONFIG = {
  asap:   { label: 'Notfall',      color: 'bg-red-100 text-red-700',    dot: 'bg-red-500' },
  today:  { label: 'Heute',        color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  week:   { label: 'Diese Woche',  color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  normal: { label: 'Flexibel',     color: 'bg-gray-100 text-gray-600',   dot: 'bg-gray-400' },
}

function timeAgo(date: string) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (mins < 1) return 'Gerade eben'
  if (mins < 60) return `vor ${mins} Min`
  const h = Math.floor(mins / 60)
  if (h < 24) return `vor ${h} Std`
  return `vor ${Math.floor(h / 24)} T`
}

function formatBudget(min?: number | null, max?: number | null) {
  if (!min && !max) return null
  const fmt = (c: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(c / 100)
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `ab ${fmt(min)}`
  return `bis ${fmt(max!)}`
}

export default async function ProviderDashboard({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; urgency?: string; q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Provider-Profil + Kategorien
  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select('*, profile:profiles(full_name)')
    .eq('id', user!.id)
    .single()

  const { data: myCategories } = await supabase
    .from('provider_categories')
    .select('category_id, category:categories(name, icon)')
    .eq('provider_id', user!.id)

  const categoryIds = myCategories?.map(c => c.category_id) ?? []

  // Offene Anfragen (eigene Kategorien)
  let query = supabase
    .from('service_requests')
    .select('*, category:categories(name, icon)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (categoryIds.length > 0 && !params.cat) {
    query = query.in('category_id', categoryIds)
  } else if (params.cat) {
    query = query.eq('category_id', parseInt(params.cat))
  }
  if (params.urgency) query = query.eq('urgency', params.urgency)

  const { data: requests } = await query.limit(30)

  // Eigene Angebote (accepted)
  const { data: myOffers } = await supabase
    .from('offers')
    .select('*, request:service_requests(title, status, city, customer:profiles(full_name))')
    .eq('provider_id', user!.id)
    .neq('status', 'withdrawn')
    .order('updated_at', { ascending: false })
    .limit(5)

  // Ungelesen Notifications
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('read', false)

  const acceptedOffers = myOffers?.filter(o => o.status === 'accepted') ?? []
  const pendingOffers  = myOffers?.filter(o => o.status === 'pending')  ?? []

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Guten Tag, {(providerProfile as { profile?: { full_name?: string } } | null)?.profile?.full_name?.split(' ')[0] ?? 'Dienstleister'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {requests?.length ?? 0} offene Anfragen in deinen Kategorien
          </p>
        </div>
        <Link href="/notifications" className="relative p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <Bell size={20} className="text-gray-600" />
          {(unreadCount ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>


      {/* Stripe Connect Banner — nur wenn nicht verbunden */}
      {!(providerProfile as { stripe_account_id?: string } | null)?.stripe_account_id && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-sm">💳 Stripe-Konto verbinden</p>
            <p className="text-purple-200 text-xs mt-0.5">Verbinde dein Stripe-Konto um Zahlungen zu empfangen</p>
          </div>
          <a href="/api/stripe/connect"
            className="bg-white text-purple-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors whitespace-nowrap">
            Jetzt verbinden
          </a>
        </div>
      )}

      {/* Schnell-Status */}
      {(acceptedOffers.length > 0 || pendingOffers.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {acceptedOffers.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm font-bold text-green-800">Akzeptierte Angebote</span>
              </div>
              <div className="text-2xl font-black text-green-700">{acceptedOffers.length}</div>
              <p className="text-xs text-green-600 mt-0.5">Aufträge laufen</p>
            </div>
          )}
          {pendingOffers.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={16} className="text-orange-600" />
                <span className="text-sm font-bold text-orange-800">Ausstehende Angebote</span>
              </div>
              <div className="text-2xl font-black text-orange-700">{pendingOffers.length}</div>
              <p className="text-xs text-orange-600 mt-0.5">Warten auf Antwort</p>
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Zap size={16} className="text-orange-500" />
            Anfragen-Inbox
          </h2>
          <Link href="/provider/dashboard" className="text-xs text-orange-500 hover:underline">Alle zeigen</Link>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['asap', 'today', 'week', 'normal'] as const).map(u => {
            const cfg = URGENCY_CONFIG[u]
            const isActive = params.urgency === u
            return (
              <Link
                key={u}
                href={`/provider/dashboard?${params.cat ? `cat=${params.cat}&` : ''}urgency=${isActive ? '' : u}`}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  isActive ? `${cfg.color} border-transparent` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Request Cards */}
      <div className="space-y-3">
        {!requests || requests.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Zap size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Keine Anfragen in deinen Kategorien</p>
            <p className="text-sm mt-1">Füge Kategorien hinzu um mehr Anfragen zu sehen</p>
            <Link href="/provider/profile" className="mt-4 inline-block text-orange-500 text-sm font-medium hover:underline">
              Kategorien bearbeiten →
            </Link>
          </div>
        ) : (
          requests.map(req => {
            const urg = URGENCY_CONFIG[(req.urgency as keyof typeof URGENCY_CONFIG) ?? 'normal']
            const budget = formatBudget(req.budget_estimate_min as number | null, req.budget_estimate_max as number | null)
            return (
              <Link key={req.id} href={`/provider/request/${req.id}`}
                className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-orange-300 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${urg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`} />
                        {urg.label}
                      </span>
                      {(req as { category?: { name?: string } }).category?.name && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          {(req as { category?: { name?: string } }).category?.name}
                        </span>
                      )}
                      {(req as { offer_count?: number }).offer_count !== undefined && (req as { offer_count?: number }).offer_count! > 0 && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                          {(req as { offer_count?: number }).offer_count} Angebot{(req as { offer_count?: number }).offer_count! > 1 ? 'e' : ''}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 text-base group-hover:text-orange-600 transition-colors truncate">
                      {req.title}
                    </h3>

                    {req.description && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{req.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      {(req.city || req.postal_code) && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {req.postal_code} {req.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {timeAgo(req.created_at as string)}
                      </span>
                      {budget && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <Euro size={12} />
                          {budget}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
                    {(req as { ai_source?: string }).ai_source && (req as { ai_source?: string }).ai_source !== 'manual' && (
                      <span className="text-[10px] text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full">✨ KI</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Meine aktiven Aufträge */}
      {acceptedOffers.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Meine aktiven Aufträge</h2>
          <div className="space-y-2">
            {acceptedOffers.map(offer => (
              <Link key={offer.id} href={`/provider/request/${(offer.request as { id?: string })?.id ?? ''}`}
                className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-2xl p-4 hover:bg-green-100 transition-colors">
                <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-green-900 text-sm truncate">{(offer.request as { title?: string })?.title}</p>
                  <p className="text-xs text-green-600">{(offer.request as { customer?: { full_name?: string } })?.customer?.full_name} · {(offer.request as { city?: string })?.city}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-700 text-sm">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(offer.price / 100)}
                  </div>
                  <div className="text-xs text-green-600">Akzeptiert ✓</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="grid grid-cols-3 gap-3 pb-6">
        <Link href="/provider/profile" className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-2xl p-4 hover:border-orange-300 transition-colors text-center">
          <Star size={20} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Mein Profil</span>
          <span className="text-xs text-gray-400">Rating: {providerProfile?.rating_avg ?? '–'} ★</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-2xl p-4 hover:border-orange-300 transition-colors text-center relative">
          <Bell size={20} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Nachrichten</span>
          <span className="text-xs text-gray-400">{unreadCount ?? 0} ungelesen</span>
          {(unreadCount ?? 0) > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full" />}
        </Link>
        <Link href="/provider/request/new" className="flex flex-col items-center gap-1.5 bg-orange-500 rounded-2xl p-4 hover:bg-orange-600 transition-colors text-center">
          <Zap size={20} className="text-white" />
          <span className="text-xs font-bold text-white">Quick-Quote</span>
          <span className="text-xs text-orange-200">Angebot abgeben</span>
        </Link>
      </div>
    </div>
  )
}
