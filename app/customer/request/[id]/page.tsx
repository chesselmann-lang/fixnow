import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Clock, MapPin, CheckCircle2, MessageSquare } from 'lucide-react'
import AcceptOfferButton from './AcceptOfferButton'
import Chat from '@/components/Chat'
import StatusTimeline from '@/components/StatusTimeline'
import ReviewPrompt from '@/components/ReviewPrompt'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

const URGENCY_LABELS: Record<string, string> = {
  asap: '🚨 Sofort – Notfall',
  today: '⚡ Heute noch',
  week: '📅 Diese Woche',
  normal: '🗓️ Kein Eildruck',
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: request } = await supabase
    .from('service_requests')
    .select('*, category:categories(name, icon)')
    .eq('id', id)
    .eq('customer_id', user!.id)
    .single()

  if (!request) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const { data: offers } = await supabase
    .from('offers')
    .select('*, provider:provider_profiles(id, rating_avg, rating_count, bio, profile:profiles(full_name, avatar_url))')
    .eq('request_id', id)
    .neq('status', 'withdrawn')
    .order('created_at', { ascending: true })

  const acceptedOffer = offers?.find(o => o.status === 'accepted')
  const isPaid = acceptedOffer?.paid_at != null

  let alreadyReviewed = false
  if (acceptedOffer) {
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('offer_id', acceptedOffer.id)
      .single()
    alreadyReviewed = !!existingReview
  }

  return (
    <div>
      <Link href="/customer/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4">
        <ArrowLeft size={16} /> Zurück
      </Link>

      <StatusTimeline
        status={request.status}
        offersCount={offers?.length ?? 0}
        hasAcceptedOffer={!!acceptedOffer}
        isPaid={isPaid}
      />

      {request.status === 'completed' && acceptedOffer && !alreadyReviewed && (
        <ReviewPrompt
          offerId={acceptedOffer.id}
          providerName={
            (Array.isArray(acceptedOffer.provider)
              ? acceptedOffer.provider[0]
              : acceptedOffer.provider)?.profile?.full_name ?? 'Dienstleister'
          }
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{request.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {request.category && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {(request.category as { name: string }).name}
                </span>
              )}
              <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
                {URGENCY_LABELS[request.urgency]}
              </span>
            </div>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ${
            request.status === 'open'        ? 'bg-blue-100 text-blue-700' :
            request.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                                               'bg-green-100 text-green-700'
          }`}>
            {request.status === 'open' ? 'Offen' : request.status === 'in_progress' ? 'Aktiv' : 'Abgeschlossen'}
          </span>
        </div>

        {request.description && (
          <p className="text-gray-600 text-sm mt-3 leading-relaxed">{request.description}</p>
        )}

        {(request.city || request.postal_code) && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
            <MapPin size={12} />
            {[request.postal_code, request.city].filter(Boolean).join(' ')}
          </div>
        )}

        {request.photos?.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {(request.photos as string[]).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" className="w-20 h-20 rounded-xl object-cover" />
            ))}
          </div>
        )}
      </div>

      {acceptedOffer && (
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
            <MessageSquare size={16} className="text-orange-500" />
            Chat mit {(Array.isArray(acceptedOffer.provider)
              ? acceptedOffer.provider[0]
              : acceptedOffer.provider)?.profile?.full_name ?? 'Dienstleister'}
          </h2>
          <Chat offerId={acceptedOffer.id} currentUserId={user!.id} currentUserName={profile?.full_name ?? ''} />
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Angebote ({offers?.length ?? 0})
        </h2>

        {!offers?.length ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <Clock size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Noch keine Angebote. Dienstleister werden gleich benachrichtigt!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map(offer => {
              const prov = Array.isArray(offer.provider) ? offer.provider[0] : offer.provider
              return (
                <div
                  key={offer.id}
                  className={`bg-white rounded-2xl shadow-sm p-5 ${offer.status === 'accepted' ? 'ring-2 ring-green-500' : ''}`}
                >
                  {offer.status === 'accepted' && (
                    <div className="flex items-center gap-1 text-green-600 text-xs font-semibold mb-3">
                      <CheckCircle2 size={14} />
                      Akzeptiertes Angebot
                      {isPaid && <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Bezahlt</span>}
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                          {prov?.profile?.full_name?.[0] ?? '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {prov?.profile?.full_name ?? 'Dienstleister'}
                          </p>
                          {prov?.rating_count > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Star size={10} className="text-yellow-400 fill-yellow-400" />
                              {Number(prov.rating_avg).toFixed(1)} ({prov.rating_count} Bewertungen)
                            </div>
                          )}
                        </div>
                      </div>
                      {offer.message && (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{offer.message}</p>
                      )}
                      {offer.available_from && (
                        <p className="text-xs text-gray-400 mt-1">
                          Verfügbar ab: {new Date(offer.available_from).toLocaleDateString('de-DE')}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-gray-900">{formatPrice(offer.price)}</p>
                      {offer.status === 'pending' && request.status === 'open' && (
                        <AcceptOfferButton
                          offerId={offer.id}
                          requestId={request.id}
                          amount={offer.price / 100}
                          providerName={prov?.profile?.full_name ?? 'Dienstleister'}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
