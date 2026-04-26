import { createClient } from '@/lib/supabase/server'
import VerifyProviderButton from './VerifyProviderButton'
import { Star } from 'lucide-react'

export default async function AdminUsers() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*, provider:provider_profiles(verified, rating_avg, rating_count)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nutzer ({users?.length ?? 0})</h1>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Rolle', 'Stadt', 'Bewertung', 'Verifiziert', 'Registriert', ''].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-500 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users?.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm font-medium text-gray-800">{u.full_name}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.role === 'provider' ? 'bg-orange-100 text-orange-700' :
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{u.city ?? '—'}</td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {u.provider?.rating_count > 0 ? (
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      {Number(u.provider.rating_avg).toFixed(1)}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-5 py-3">
                  {u.role === 'provider' ? (
                    u.provider?.verified
                      ? <span className="text-xs text-green-600 font-medium">✓ Verifiziert</span>
                      : <VerifyProviderButton providerId={u.id} />
                  ) : '—'}
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">
                  {new Date(u.created_at).toLocaleDateString('de-DE')}
                </td>
                <td className="px-5 py-3 text-xs">
                  <a href={`mailto:${u.id}`} className="text-orange-500 hover:underline">Details</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
