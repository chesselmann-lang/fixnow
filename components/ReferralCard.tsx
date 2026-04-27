'use client'

import { useState, useEffect } from 'react'
import { Link2, Copy, CheckCheck, Users } from 'lucide-react'

export default function ReferralCard() {
  const [code, setCode]     = useState<string | null>(null)
  const [uses, setUses]     = useState(0)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/referral/code')
      .then(r => r.json())
      .then(d => { setCode(d.code); setUses(d.uses ?? 0) })
      .finally(() => setLoading(false))
  }, [])

  const link = code ? `${typeof window !== 'undefined' ? window.location.origin : 'https://supafix.de'}/join/${code}` : ''

  async function copyLink() {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return null

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Link2 size={18} className="text-purple-500" />
        <h3 className="font-bold text-gray-800 text-sm">Freunde einladen</h3>
        {uses > 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
            <Users size={11} />
            {uses} Eingeladen
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Teile deinen Link — Neukunden sparen 10 % auf ihre erste Zahlung,
        du bekommst 5 € Bonus nach ihrer ersten Buchung.
      </p>

      {code && (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-white border border-purple-200 rounded-xl px-3 py-2">
            <p className="text-xs text-gray-400 truncate">{link}</p>
          </div>
          <button
            onClick={copyLink}
            className={`shrink-0 flex items-center gap-1.5 font-semibold text-sm px-3 py-2 rounded-xl transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
            {copied ? 'Kopiert!' : 'Kopieren'}
          </button>
        </div>
      )}
    </div>
  )
}
