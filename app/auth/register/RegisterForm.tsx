'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Wrench, User, Briefcase } from 'lucide-react'
import type { UserRole } from '@/lib/types'

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get('role') as UserRole) ?? 'customer'
  const refCode = searchParams.get('ref') ?? ''

  const [role, setRole] = useState<UserRole>(initialRole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role, ...(refCode && { referred_by_code: refCode }) } },
    })
    if (error) { setError(error.message); setLoading(false); return }

    if (role === 'provider') {
      router.push('/provider/onboarding')
    } else {
      const flow = searchParams.get('flow')
      router.push(flow === 'request' ? '/customer/new-request' : '/customer/dashboard')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <Wrench size={20} className="text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">supa<span className="text-orange-500">fix</span></span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Kostenloses Konto erstellen</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['customer', 'provider'] as UserRole[]).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  role === r ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                }`}>
                {r === 'customer' ? <User size={22} /> : <Briefcase size={22} />}
                <span className="font-semibold text-sm">{r === 'customer' ? 'Ich bin Kunde' : 'Ich bin Dienstleister'}</span>
                <span className="text-xs opacity-70">{r === 'customer' ? 'Kostenlos' : '10% Provision/Auftrag'}</span>
              </button>
            ))}
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            {['Vollständiger Name', 'E-Mail', 'Passwort'].map((label, i) => (
              <div key={label}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                <input
                  type={i === 2 ? 'password' : i === 1 ? 'email' : 'text'}
                  value={i === 0 ? fullName : i === 1 ? email : password}
                  onChange={e => [setFullName, setEmail, setPassword][i](e.target.value)}
                  required minLength={i === 2 ? 8 : undefined}
                  placeholder={i === 0 ? 'Max Mustermann' : i === 1 ? 'name@beispiel.de' : 'Mindestens 8 Zeichen'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Registrierung läuft...' : `Als ${role === 'customer' ? 'Kunde' : 'Dienstleister'} registrieren`}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Bereits ein Konto?{' '}
            <Link href="/auth/login" className="text-orange-500 font-medium hover:underline">Anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
