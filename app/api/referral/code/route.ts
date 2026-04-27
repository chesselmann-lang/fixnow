import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function randomCode(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'user'
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${slug}-${suffix}`
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check existing code
    const { data: existing } = await supabase
      .from('referral_codes')
      .select('code, uses')
      .eq('owner_id', user.id)
      .single()

    if (existing) return NextResponse.json(existing)

    // Create new code
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const code = randomCode(profile?.full_name ?? 'user')

    const { data: created, error } = await supabase
      .from('referral_codes')
      .insert({ owner_id: user.id, code })
      .select('code, uses')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(created)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
