import { createClient } from '@/lib/supabase/server'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  succeeded: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-500',
}

export default async function AdminPayments() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('payments')
    .select('*, customer:profiles!customer_id(full_name), provider:profiles!provider_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const total = payments?.filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0) ?? 0
  const fees = payments?.filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.platform_fee, 0) ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Zahlungen</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Umsatz gesamt</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatPrice(total)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Plattform-Gebühren (10%)</p>
          <p className="text-xl font-bold text-green-600 mt-1">{formatPrice(fees)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Transaktionen</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{payments?.length ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Kunde', 'Dienstleister', 'Betrag', 'Gebühr', 'Status', 'Datum'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-500 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments?.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm text-gray-700">{(p.customer as { full_name?: string })?.full_name ?? '—'}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{(p.provider as { full_name?: string })?.full_name ?? '—'}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-900">{formatPrice(p.amount)}</td>
                <td className="px-5 py-3 text-sm text-green-600">{formatPrice(p.platform_fee)}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] ?? ''}`}>{p.status}</span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('de-DE')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
