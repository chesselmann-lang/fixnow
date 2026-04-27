import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, CheckCircle2, Clock, CreditCard, Star, Euro } from 'lucide-react'

function fmt(cents: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function ProviderEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select('id, rating_avg, rating_count, stripe_account_id, stripe_verified')
    .eq('id', user!.id)
    .single()

  // All accepted/paid offers for this provider
  const { data: offers } = await supabase
    .from('offers')
    .select(`
      id, price, status, paid_at, created_at,
      request:service_requests(title, city, postal_code, customer_id, completed_at)
    `)
    .eq('provider_id', user!.id)
    .in('status', ['accepted', 'completed', 'paid'])
    .order('created_at', { ascending: false })

  const paid   = offers?.filter(o => o.paid_at) ?? []
  const active = offers?.filter(o => !o.paid_at && o.status === 'accepted') ?? []

  const totalGross  = paid.reduce((s, o) => s + o.price, 0)
  const platformFee = Math.round(totalGross * 0.10)
  const totalNet    = totalGross - platformFee

  // This month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonth = paid.filter(o => o.paid_at && new Date(o.paid_at) >= monthStart)
  const thisMonthNet = thisMonth.reduce((s, o) => s + o.price, 0) * 0.9

  return (
    <div>
      <Link href="/provider/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5">
        <ArrowLeft size={16} /> Zurück zum Dashboard
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={22} className="text-orange-500" />
        <h1 className="text-2xl font-bold text-gray-900">Meine Einnahmen</h1>
      </div>

      {/* Stripe Connect Status */}
      {!providerProfile?.stripe_account_id ? (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 mb-6 text-white">
          <p className="font-bold text-base mb-1">Stripe noch nicht verbunden</p>
          <p className="text-purple-100 text-sm mb-4">Verbinde dein Konto um Zahlungen zu empfangen</p>
          <a
            href="/api/stripe/connect"
            className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-purple-50 transition-colors"
          >
            <CreditCard size={16} />
            Jetzt verbinden
          </a>
        </div>
      ) : !providerProfile.stripe_verified ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Clock size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Stripe-Verifizierung ausstehend</p>
            <p className="text-amber-600 text-xs mt-0.5">Stripe prüft dein Konto. Zahlungen werden nach Freigabe ausgezahlt.</p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-500" />
          <p className="text-green-700 font-semibold text-sm">Stripe verbunden & verifiziert — Auszahlungen aktiv</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 col-span-2">
          <p className="text-xs text-gray-400 mb-1">Gesamteinnahmen (netto)</p>
          <p className="text-3xl font-bold text-gray-900">{fmt(totalNet)}</p>
          <p className="text-xs text-gray-400 mt-1">nach 10 % Plattformgebühr von {fmt(totalGross)} brutto</p>
        </div>

        <div className="bg-orange-50 rounded-2xl p-4">
          <Euro size={16} className="text-orange-500 mb-2" />
          <p className="text-xl font-bold text-gray-900">{fmt(thisMonthNet)}</p>
          <p className="text-xs text-gray-500">Dieser Monat</p>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4">
          <CheckCircle2 size={16} className="text-blue-500 mb-2" />
          <p className="text-xl font-bold text-gray-900">{paid.length}</p>
          <p className="text-xs text-gray-500">Bezahlte Jobs</p>
        </div>

        <div className="bg-amber-50 rounded-2xl p-4">
          <Clock size={16} className="text-amber-500 mb-2" />
          <p className="text-xl font-bold text-gray-900">{active.length}</p>
          <p className="text-xs text-gray-500">Laufende Jobs</p>
        </div>

        <div className="bg-yellow-50 rounded-2xl p-4">
          <Star size={16} className="text-yellow-500 mb-2 fill-yellow-400" />
          <p className="text-xl font-bold text-gray-900">
            {providerProfile?.rating_count
              ? `${Number(providerProfile.rating_avg).toFixed(1)} ★`
              : '–'}
          </p>
          <p className="text-xs text-gray-500">
            {providerProfile?.rating_count
              ? `${providerProfile.rating_count} Bewertungen`
              : 'Noch keine Bewertung'}
          </p>
        </div>
      </div>

      {/* Active jobs */}
      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            Laufende Aufträge ({active.length})
          </h2>
          <div className="space-y-2">
            {active.map(o => {
              const req = Array.isArray(o.request) ? o.request[0] : o.request
              return (
                <div key={o.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{req?.title ?? 'Auftrag'}</p>
                    {(req?.city || req?.postal_code) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[req.postal_code, req.city].filter(Boolean).join(' ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{fmt(Math.round(o.price * 0.9))}</p>
                    <p className="text-xs text-gray-400">ausstehend</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <CreditCard size={16} className="text-gray-400" />
          Zahlungshistorie ({paid.length})
        </h2>

        {paid.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <Euro size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Noch keine abgeschlossenen Zahlungen</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {paid.map((o, i) => {
              const req = Array.isArray(o.request) ? o.request[0] : o.request
              const net = Math.round(o.price * 0.9)
              return (
                <div
                  key={o.id}
                  className={`flex items-center justify-between px-5 py-4 ${i < paid.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{req?.title ?? 'Auftrag'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {o.paid_at ? fmtDate(o.paid_at) : fmtDate(o.created_at)}
                      {(req?.city || req?.postal_code) && (
                        <> · {[req.postal_code, req.city].filter(Boolean).join(' ')}</>
                      )}
                    </p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="font-bold text-green-600 text-sm">+{fmt(net)}</p>
                    <p className="text-xs text-gray-300 line-through">{fmt(o.price)}</p>
                  </div>
                </div>
              )
            })}
            {/* Total footer */}
            <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-700">Gesamt (netto)</p>
              <p className="text-base font-bold text-gray-900">{fmt(totalNet)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stripe info */}
      <div className="mt-6 bg-gray-50 rounded-2xl p-4 text-xs text-gray-400 leading-relaxed">
        <p className="font-semibold text-gray-500 mb-1">Auszahlungsdetails</p>
        Die Plattformgebühr beträgt 10 % pro Auftrag. Stripe überweist den Nettobetrag nach Auftragsabschluss 
        automatisch auf dein hinterlegtes Bankkonto (i.d.R. 2–7 Werktage).
      </div>
    </div>
  )
}
