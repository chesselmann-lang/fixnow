import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const OPENAI_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_KEY) return NextResponse.json({ text: '' })

  const formData = await request.formData()
  const audioFile = formData.get('audio') as File | null
  if (!audioFile) return NextResponse.json({ error: 'No audio' }, { status: 400 })

  try {
    const fd = new FormData()
    fd.append('file', audioFile, 'audio.webm')
    fd.append('model', 'whisper-1')
    fd.append('language', 'de')
    fd.append('prompt', 'Handwerker, Reparatur, Sanitär, Elektrik, Garten, Reinigung, Wohnhaus')

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}` },
      body: fd,
    })
    const data = await res.json()
    return NextResponse.json({ text: data.text ?? '' })
  } catch (err) {
    console.error('Whisper error:', err)
    return NextResponse.json({ text: '' })
  }
}
