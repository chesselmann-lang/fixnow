import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wrench, Plus, LayoutDashboard, LogOut } from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role === 'provider') redirect('/provider/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/customer/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench size={15} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">supa<span className="text-orange-500">fix</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell userId={user.id} />
            <Link href="/customer/new-request"
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3.5 py-1.5 rounded-full transition-colors">
              <Plus size={15} />
              Neu
            </Link>
          </div>
        </div>
      </header>
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 flex gap-6">
          <Link href="/customer/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 py-3 border-b-2 border-transparent hover:border-gray-300 transition-all">
            <LayoutDashboard size={15} />
            Dashboard
          </Link>
          <Link href="/customer/new-request" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 py-3 border-b-2 border-transparent hover:border-gray-300 transition-all">
            <Plus size={15} />
            Neue Anfrage
          </Link>
          <Link href="/customer/profile" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 py-3 border-b-2 border-transparent hover:border-gray-300 transition-all ml-auto">
            Profil
          </Link>
          <Link href="/auth/logout" className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 py-3">
            <LogOut size={14} />
          </Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
