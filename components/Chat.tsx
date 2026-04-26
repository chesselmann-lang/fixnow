'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2 } from 'lucide-react'
import type { Message, Profile } from '@/lib/types'

interface ChatProps {
  offerId: string
  currentUserId: string
  currentUserName: string
}

export default function Chat({ offerId, currentUserId, currentUserName }: ChatProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<(Message & { sender: Profile })[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Nachrichten laden
  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles(id, full_name, avatar_url)')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: true })
      setMessages((data ?? []) as (Message & { sender: Profile })[])
      setLoading(false)
    }
    loadMessages()

    // Realtime-Subscription
    const channel = supabase
      .channel(`chat-${offerId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `offer_id=eq.${offerId}` },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles(id, full_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          if (data) setMessages(prev => [...prev, data as Message & { sender: Profile }])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [offerId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Ungelesene markieren
  useEffect(() => {
    if (messages.length === 0) return
    const unread = messages
      .filter(m => m.sender_id !== currentUserId && !m.read_at)
      .map(m => m.id)
    if (unread.length > 0) {
      supabase.from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unread)
        .then(() => {})
    }
  }, [messages, currentUserId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')
    await supabase.from('messages').insert({ offer_id: offerId, content })
    setSending(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <Loader2 className="animate-spin text-orange-400" size={24} />
    </div>
  )

  return (
    <div className="flex flex-col h-[420px] bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full" />
        <span className="text-sm font-semibold text-gray-700">Direktnachricht</span>
      </div>

      {/* Nachrichtenbereich */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            Noch keine Nachrichten. Schreib die erste!
          </div>
        ) : messages.map(msg => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                isMe ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {msg.sender?.full_name?.[0] ?? '?'}
              </div>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-orange-500 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(msg.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  {isMe && msg.read_at && ' · ✓✓'}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-gray-100 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nachricht schreiben…"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-xl transition-colors disabled:opacity-40"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  )
}
