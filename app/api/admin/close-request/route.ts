import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { requestId } = await req.json()
    if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 })

    const now = new Date().toISOString()

    await supabase
      .from('service_requests')
      .update({ status: 'completed', completed_at: now })
      .eq('id', requestId)

    await supabase
      .from('offers')
      .update({ status: 'completed' })
      .eq('request_id', requestId)
      .eq('status', 'accepted')

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('close-request error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
