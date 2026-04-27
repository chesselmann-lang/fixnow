import type { Metadata } from 'next'
import Link from 'next/link'
import { Gift, CheckCircle, ArrowRight, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return {
    title: `Einladung zu supafix — 10 % Rabatt auf deinen ersten Auftrag`,
    description: `Du wurdest zu supafix eingeladen! Registriere dich jetzt und spare 10 % auf deine erste Zahlung. Code: ${code}`,
  }
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()

  // Validate code exists
  const { data: refCode } = await supabase
    .from('referral_codes')
    .select('id, uses, owner_id')
    .eq('code', code)
    .single()

  // Get inviter name if code is valid
  let inviterName = 'jemand'
  if (refCode) {
    const { data: owner } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', refCode.owner_id)
      .single()
    if (owner?.full_name) inviterName = owner.full_name.split(' ')[0]
  }

  const isValid = !!refCode

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full">
        {/* Gift icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200">
          <Gift size={36} className="text-white" />
        </div>

        {isValid ? (
          <>
            <h1 className="text-3xl font-black text-gray-900 text-center mb-2">
              {inviterName} lädt dich ein!
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Registriere dich jetzt und spare auf deinen ersten Auftrag
            </p>

            {/* Benefit card */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎁</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">10 % Rabatt</p>
                  <p className="text-sm text-gray-500">auf deine erste Zahlung</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  'Kostenlose Registrierung',
                  'Bis zu 5 Angebote in 1 Stunde',
                  'Zahlung sicher hinterlegt',
                  '10 % Rabatt automatisch angewendet',
                ].map(b => (
                  <div key={b} className="flex items-center gap-2.5">
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                    <span className="text-sm text-gray-700">{b}</span>
                  </div>
                ))}
              </div>

              {/* Code badge */}
              <div className="mt-5 bg-orange-50 border border-dashed border-orange-300 rounded-xl p-3 text-center">
                <p className="text-xs text-orange-600 font-semibold mb-0.5">Dein Einladungscode</p>
                <p className="text-lg font-black text-orange-500 tracking-wider">{code.toUpperCase()}</p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/auth/register?ref=${code}`}
              className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-2xl shadow-md transition-all hover:-translate-y-0.5"
            >
              Jetzt kostenlos registrieren <ArrowRight size={20} />
            </Link>
            <p className="text-center text-gray-400 text-xs mt-3">
              Bereits Konto? <Link href={`/auth/login?ref=${code}`} className="text-orange-500 hover:underline">Einloggen</Link>
            </p>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-1 mt-6 text-gray-400 text-xs">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="ml-1">Über {(refCode?.uses ?? 0) + 127} zufriedene Nutzer</span>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black text-gray-900 text-center mb-3">
              Einladungslink nicht gefunden
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Dieser Einladungslink ist leider ungültig oder abgelaufen.
            </p>
            <Link
              href="/auth/register"
              className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white font-bold py-4 rounded-2xl"
            >
              Trotzdem registrieren <ArrowRight size={20} />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
