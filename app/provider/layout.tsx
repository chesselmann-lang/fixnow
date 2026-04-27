import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wrench, LayoutDashboard, Star, LogOut } from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'provider') redirect('/customer/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/provider/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench size={15} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">supa<span className="text-orange-500">fix</span></span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium ml-1">Pro</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell userId={user.id} />
            <Link href="/auth/logout" className="text-gray-400 hover:text-gray-600 p-2">
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </header>
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 flex gap-6">
          <Link href="/provider/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 py-3 border-b-2 border-transparent hover:border-gray-300 transition-all">
            <LayoutDashboard size={15} />
            Anfragen
          </Link>
          <Link href="/provider/profile" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 py-3 border-b-2 border-transparent hover:border-gray-300 transition-all">
            <Star size={15} />
            Profil
          </Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
