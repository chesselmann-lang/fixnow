import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ClipboardList, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react'
import CloseRequestButton from './CloseRequestButton'

const STATUS_CONFIG = {
  open:        { label: 'Offen',          color: 'bg-blue-100 text-blue-700',   icon: Clock },
  in_progress: { label: 'In Bearbeitung', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  completed:   { label: 'Abgeschlossen',  color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cancelled:   { label: 'Storniert',      color: 'bg-gray-100 text-gray-400',   icon: XCircle },
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: '2-digit' })
}

export default async function AdminRequests({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('service_requests')
    .select(`
      id, title, status, urgency, created_at, city, postal_code,
      customer:profiles!customer_id(full_name, email),
      category:categories(name),
      offers(id, status, price)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (status && status !== 'all') query = query.eq('status', status)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: requests } = await query

  const counts = {
    all:         requests?.length ?? 0,
    open:        requests?.filter(r => r.status === 'open').length ?? 0,
    in_progress: requests?.filter(r => r.status === 'in_progress').length ?? 0,
    completed:   requests?.filter(r => r.status === 'completed').length ?? 0,
    cancelled:   requests?.filter(r => r.status === 'cancelled').length ?? 0,
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList size={22} className="text-orange-500" />
        <h1 className="text-2xl font-bold text-gray-900">Aufträge</h1>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', 'open', 'in_progress', 'completed', 'cancelled'] as const).map(s => {
          const active = (status ?? 'all') === s
          const labels: Record<string, string> = { all: 'Alle', open: 'Offen', in_progress: 'Aktiv', completed: 'Abgeschlossen', cancelled: 'Storniert' }
          return (
            <Link
              key={s}
              href={`/admin/requests?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {labels[s]} ({counts[s]})
            </Link>
          )
        })}
      </div>

      {/* Search */}
      <form className="mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Auftrag suchen…"
          className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        {status && <input type="hidden" name="status" value={status} />}
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                {['Auftrag', 'Status', 'Kunde', 'Ort', 'Angebote', 'Erstellt', 'Aktion'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests?.map(req => {
                const s = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.open
                const offers = (req.offers ?? []) as { id: string; status: string; price: number }[]
                const offerCount = offers.filter(o => o.status !== 'withdrawn').length
                const accepted  = offers.find(o => o.status === 'accepted')
                const customer  = Array.isArray(req.customer) ? req.customer[0] : req.customer
                const category  = Array.isArray(req.category) ? req.category[0] : req.category

                return (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800 max-w-[200px] truncate">{req.title}</p>
                      {category && <p className="text-xs text-gray-400">{(category as { name: string }).name}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>
                        <s.icon size={11} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{customer?.full_name ?? '–'}</p>
                      <p className="text-xs text-gray-400">{customer?.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {[req.postal_code, req.city].filter(Boolean).join(' ') || '–'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${offerCount > 0 ? 'text-orange-500' : 'text-gray-300'}`}>
                        {offerCount}
                      </span>
                      {accepted && (
                        <p className="text-xs text-green-600">✓ akzeptiert</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{fmt(req.created_at)}</td>
                    <td className="px-4 py-3">
                      {req.status === 'in_progress' && (
                        <CloseRequestButton requestId={req.id} />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!requests?.length && (
          <div className="text-center py-12 text-gray-400 text-sm">Keine Aufträge gefunden</div>
        )}
      </div>
    </div>
  )
}
