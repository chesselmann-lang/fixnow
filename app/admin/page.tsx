import { createClient } from '@/lib/supabase/server'
import { Users, ClipboardList, Tag, CreditCard } from 'lucide-react'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: userCount },
    { count: requestCount },
    { count: offerCount },
    { count: openCount },
    { data: recentRequests },
    { data: payments },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }),
    supabase.from('offers').select('*', { count: 'exact', head: true }),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('service_requests')
      .select('id, title, status, created_at, offer_count, customer:profiles!customer_id(full_name)')
      .order('created_at', { ascending: false }).limit(10),
    supabase.from('payments').select('amount').eq('status', 'succeeded'),
  ])

  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount * 0.1), 0) ?? 0

  const stats = [
    { icon: Users, label: 'Gesamt-Nutzer', value: userCount ?? 0, color: 'text-blue-500' },
    { icon: ClipboardList, label: 'Aufträge gesamt', value: requestCount ?? 0, color: 'text-orange-500' },
    { icon: Tag, label: 'Offene Aufträge', value: openCount ?? 0, color: 'text-yellow-500' },
    { icon: CreditCard, label: 'Plattform-Umsatz', value: formatPrice(totalRevenue), color: 'text-green-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <s.icon size={22} className={s.color} />
            <div className="text-2xl font-bold text-gray-900 mt-3">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Neueste Aufträge</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Titel', 'Kunde', 'Angebote', 'Status', 'Erstellt'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-500 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentRequests?.map(req => (
              <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm text-gray-800 font-medium max-w-xs truncate">{req.title}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{(req.customer as { full_name?: string })?.full_name ?? '—'}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{req.offer_count}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    req.status === 'open' ? 'bg-blue-100 text-blue-700' :
                    req.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                    req.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">
                  {new Date(req.created_at).toLocaleDateString('de-DE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
