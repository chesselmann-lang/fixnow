import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, MapPin, Shield, ArrowRight, CheckCircle2, Calendar, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('provider_profiles')
    .select('bio, profile:profiles(full_name), categories:provider_categories(category:categories(name))')
    .eq('id', id)
    .single()

  if (!data) return { title: 'Dienstleister nicht gefunden' }

  const name = (Array.isArray(data.profile) ? data.profile[0] : data.profile)?.full_name ?? 'Dienstleister'
  const cats = ((data.categories ?? []) as { category: { name: string } }[]).map(c => c.category?.name).filter(Boolean).join(', ')

  return {
    title: `${name} — ${cats || 'Dienstleister'} auf supafix`,
    description: data.bio || `${name} bietet Dienstleistungen auf supafix.de an. Preise vergleichen & direkt anfragen.`,
    openGraph: {
      title: `${name} auf supafix`,
      description: data.bio || `Jetzt anfragen bei ${name}`,
      type: 'profile',
    },
  }
}

export default async function ProviderPublicProfile({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: provider } = await supabase
    .from('provider_profiles')
    .select(`
      id, bio, rating_avg, rating_count, verified, stripe_verified,
      service_radius_km, created_at,
      profile:profiles(full_name, avatar_url, city),
      categories:provider_categories(category:categories(name, icon))
    `)
    .eq('id', id)
    .single()

  if (!provider) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment, created_at, reviewer:profiles(full_name)')
    .eq('reviewee_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const profile = Array.isArray(provider.profile) ? provider.profile[0] : provider.profile
  const name = profile?.full_name ?? 'Dienstleister'
  const cats = ((provider.categories ?? []) as { category: { name: string; icon: string } }[])
    .map(c => c.category)
    .filter(Boolean)

  const memberSince = new Date(provider.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
  const rating = Number(provider.rating_avg ?? 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description: provider.bio || `Dienstleister auf supafix.de`,
    url: `https://supafix.de/dienstleister/${id}`,
    ...(profile?.city && { address: { '@type': 'PostalAddress', addressLocality: profile.city, addressCountry: 'DE' } }),
    ...(provider.rating_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toFixed(1),
        reviewCount: provider.rating_count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-black text-3xl shrink-0 shadow-md">
                {profile?.avatar_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={profile.avatar_url} alt={name} className="w-full h-full rounded-2xl object-cover" />
                  : name[0]}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-gray-900">{name}</h1>

                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {provider.rating_count > 0 ? (
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={14} className={n <= Math.round(rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200 fill-gray-200'} />
                      ))}
                      <span className="text-sm font-bold text-gray-800 ml-1">{rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-400">({provider.rating_count})</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Noch keine Bewertungen</span>
                  )}

                  {provider.verified && (
                    <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      <Shield size={11} /> Verifiziert
                    </span>
                  )}
                  {provider.stripe_verified && (
                    <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                      <CheckCircle2 size={11} /> Bezahlt-Account
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                  {profile?.city && (
                    <span className="flex items-center gap-1"><MapPin size={11} />{profile.city}</span>
                  )}
                  <span className="flex items-center gap-1"><Calendar size={11} />Dabei seit {memberSince}</span>
                  {provider.service_radius_km && (
                    <span className="flex items-center gap-1"><Award size={11} />Radius: {provider.service_radius_km} km</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

          {/* Bio */}
          {provider.bio && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Über mich</h2>
              <p className="text-gray-700 leading-relaxed">{provider.bio}</p>
            </div>
          )}

          {/* Categories */}
          {cats.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Leistungen</h2>
              <div className="flex flex-wrap gap-2">
                {cats.map(cat => (
                  <span key={cat.name} className="flex items-center gap-1.5 bg-orange-50 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full">
                    <span>{cat.icon}</span>
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white text-center">
            <p className="font-bold text-lg mb-1">Interesse? Stell eine Anfrage!</p>
            <p className="text-orange-100 text-sm mb-5">Kostenlos · Unverbindlich · Antwort oft in Minuten</p>
            <Link
              href="/customer/new-request"
              className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-3 rounded-xl shadow hover:shadow-md transition-all"
            >
              Jetzt Auftrag erstellen <ArrowRight size={18} />
            </Link>
          </div>

          {/* Reviews */}
          {(reviews?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Bewertungen ({provider.rating_count})
              </h2>
              <div className="space-y-3">
                {reviews!.map((rev, i) => {
                  const reviewer = Array.isArray(rev.reviewer) ? rev.reviewer[0] : rev.reviewer
                  return (
                    <div key={i} className="bg-white rounded-2xl shadow-sm p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {reviewer?.full_name ?? 'Kunde'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(rev.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} size={12} className={n <= rev.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-200 fill-gray-200'} />
                          ))}
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Footer back link */}
          <div className="text-center pb-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
              ← Zurück zu supafix.de
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
