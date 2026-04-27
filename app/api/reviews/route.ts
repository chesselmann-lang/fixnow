import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { offerId, rating, comment } = await req.json()
    if (!offerId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Verify offer belongs to this customer
    const { data: offer } = await supabase
      .from('offers')
      .select('id, request_id, provider_id, request:service_requests(customer_id)')
      .eq('id', offerId)
      .single()

    if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })

    const requestData = Array.isArray(offer.request) ? offer.request[0] : offer.request
    if (requestData?.customer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Upsert review (one review per offer)
    const { error: reviewErr } = await supabase
      .from('reviews')
      .upsert({
        offer_id: offerId,
        reviewer_id: user.id,
        reviewee_id: offer.provider_id,
        rating,
        comment: comment?.trim() || null,
      }, { onConflict: 'offer_id' })

    if (reviewErr) {
      console.error('Review upsert error:', reviewErr)
      return NextResponse.json({ error: reviewErr.message }, { status: 500 })
    }

    // Update provider rating_avg + rating_count
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', offer.provider_id)

    if (reviews && reviews.length > 0) {
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      await supabase
        .from('provider_profiles')
        .update({ rating_avg: Math.round(avg * 10) / 10, rating_count: reviews.length })
        .eq('id', offer.provider_id)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Review API error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
