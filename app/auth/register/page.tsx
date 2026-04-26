'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Wrench, User, Briefcase } from 'lucide-react'
import type { UserRole } from '@/lib/types'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>('customer')
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
      options: {
        data: { full_name: fullName, role },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-orange-500 font-bold text-2xl">
            <Wrench size={28} />
            FixNow
          </Link>
          <p className="text-gray-500 mt-2">Konto erstellen</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-semibold mb-6">Wer bist du?</h1>

          {/* Rollenauswahl */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === 'customer'
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <User size={24} />
              <span className="font-medium text-sm">Ich bin Kunde</span>
              <span className="text-xs opacity-70">Ich brauche Hilfe</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('provider')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === 'provider'
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Briefcase size={24} />
              <span className="font-medium text-sm">Ich bin Dienstleister</span>
              <span className="text-xs opacity-70">Ich biete Hilfe an</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vollständiger Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder="Max Mustermann"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder="name@beispiel.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Wird registriert…' : `Als ${role === 'customer' ? 'Kunde' : 'Dienstleister'} registrieren`}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Bereits ein Konto?{' '}
            <Link href="/auth/login" className="text-orange-500 font-medium hover:underline">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
