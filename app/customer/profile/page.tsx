'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, CheckCircle } from 'lucide-react'

export default function CustomerProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setFullName(data.full_name ?? '')
        setPhone(data.phone ?? '')
        setCity(data.city ?? '')
        setPostalCode(data.postal_code ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({
      full_name: fullName,
      phone: phone || null,
      city: city || null,
      postal_code: postalCode || null,
    }).eq('id', user!.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="animate-spin text-orange-500" size={28} />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Mein Profil</h1>
      <p className="text-gray-500 text-sm mb-6">Persönliche Angaben bearbeiten</p>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="+49 123 456789"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
            <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
          {saving ? <><Loader2 size={16} className="animate-spin" /> Speichern…</> :
           saved ? <><CheckCircle size={16} /> Gespeichert!</> :
           <><Save size={16} /> Speichern</>}
        </button>
      </form>
    </div>
  )
}
