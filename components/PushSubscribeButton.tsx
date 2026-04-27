'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, BellRing } from 'lucide-react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function PushSubscribeButton() {
  const [status, setStatus] = useState<'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'>('loading')
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => {
        setStatus(sub ? 'subscribed' : 'unsubscribed')
      })
    )
  }, [])

  async function subscribe() {
    setToggling(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      setStatus('subscribed')
    } catch (err) {
      console.error('Push subscribe error:', err)
      if (Notification.permission === 'denied') setStatus('denied')
    } finally {
      setToggling(false)
    }
  }

  async function unsubscribe() {
    setToggling(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setStatus('unsubscribed')
    } finally {
      setToggling(false)
    }
  }

  if (status === 'loading') return null
  if (status === 'unsupported') return null

  if (status === 'denied') {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <BellOff size={14} />
        Notifications blockiert — in Browser-Einstellungen freigeben
      </div>
    )
  }

  if (status === 'subscribed') {
    return (
      <button
        onClick={unsubscribe}
        disabled={toggling}
        className="flex items-center gap-2 text-xs text-green-600 bg-green-50 hover:bg-green-100 font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
      >
        <BellRing size={14} />
        {toggling ? '…' : 'Push aktiv — deaktivieren'}
      </button>
    )
  }

  return (
    <button
      onClick={subscribe}
      disabled={toggling}
      className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
    >
      <Bell size={14} />
      {toggling ? 'Aktiviere…' : '🔔 Push-Notifications aktivieren'}
    </button>
  )
}
