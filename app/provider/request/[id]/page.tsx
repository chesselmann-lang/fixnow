import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Camera, MessageSquare } from 'lucide-react'
import SubmitOfferForm from './SubmitOfferForm'
import Chat from '@/components/Chat'

const URGENCY_LABELS: Record<string, string> = {
  asap: '🚨 Sofort – Notfall',
  today: '⚡ Heute noch',
  week: '📅 Diese Woche',
  normal: '🗓️ Kein Eildruck',
}

export default async function ProviderRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user!.id).single()

  const { data: request } = await supabase
    .from('service_requests')
    .select('*, category:categories(name)')
    .eq('id', id)
    .single()

  if (!request || (request.status !== 'open' && request.status !== 'in_progress')) notFound()

  const { data: existingOffer } = await supabase
    .from('offers')
    .select('id, price, message, status')
    .eq('request_id', id)
    .eq('provider_id', user!.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/provider/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4">
        <ArrowLeft size={16} /> Zurück
      </Link>

      {/* Auftrag-Detail */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h1 className="text-xl font-bold text-gray-900">{request.title}</h1>
          <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full shrink-0 font-medium">
            {URGENCY_LABELS[request.urgency]}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {request.category && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{request.category.name}</span>
          )}
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
            {request.offer_count} Angebot{request.offer_count !== 1 ? 'e' : ''} bisher
          </span>
        </div>

        {request.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-3">{request.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
          {(request.city || request.postal_code) && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {[request.postal_code, request.city].filter(Boolean).join(' ')}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(request.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {request.photos?.length > 0 && (
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-4 mb-2">
              <Camera size={12} /> {request.photos.length} Foto{request.photos.length > 1 ? 's' : ''}
            </div>
            <div className="flex gap-2 flex-wrap">
              {request.photos.map((url: string, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" className="w-24 h-24 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Angebot abgeben oder Chat */}
      {existingOffer ? (
        <div className="space-y-4">
          <div className={`rounded-2xl p-5 border-2 ${
            existingOffer.status === 'accepted'
              ? 'bg-green-50 border-green-200'
              : existingOffer.status === 'rejected'
              ? 'bg-red-50 border-red-200'
              : 'bg-orange-50 border-orange-200'
          }`}>
            {existingOffer.status === 'accepted' && (
              <h2 className="font-bold text-green-700 mb-1">🎉 Glückwunsch – Auftrag gewonnen!</h2>
            )}
            {existingOffer.status === 'pending' && (
              <h2 className="font-semibold text-orange-700 mb-1">⏳ Angebot wartet auf Antwort</h2>
            )}
            {existingOffer.status === 'rejected' && (
              <h2 className="font-semibold text-red-700 mb-1">Angebot nicht angenommen</h2>
            )}
            <p className="text-sm opacity-80">
              Dein Angebot: {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(existingOffer.price / 100)}
            </p>
            {existingOffer.message && (
              <p className="text-sm italic opacity-70 mt-1">"{existingOffer.message}"</p>
            )}
          </div>

          {existingOffer.status === 'accepted' && (
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                <MessageSquare size={16} className="text-orange-500" />
                Chat mit Kunde
              </h3>
              <Chat offerId={existingOffer.id} currentUserId={user!.id} currentUserName={profile?.full_name ?? ''} />
            </div>
          )}
        </div>
      ) : (
        <SubmitOfferForm requestId={id} />
      )}
    </div>
  )
}
