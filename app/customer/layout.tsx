import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wrench, Home, PlusCircle, Bell, User, LogOut } from 'lucide-react'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'provider') redirect('/provider/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/customer/dashboard" className="flex items-center gap-2 text-orange-500 font-bold text-lg">
            <Wrench size={20} />
            FixNow
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500 mr-2">Hallo, {profile?.full_name?.split(' ')[0]}</span>
            <form action="/auth/logout" method="POST">
              <button type="submit" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Bottom Nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="grid grid-cols-4 h-16">
          {[
            { href: '/customer/dashboard', icon: Home, label: 'Übersicht' },
            { href: '/customer/new-request', icon: PlusCircle, label: 'Neu' },
            { href: '/customer/notifications', icon: Bell, label: 'Angebote' },
            { href: '/customer/profile', icon: User, label: 'Profil' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-orange-500 transition-colors">
              <item.icon size={22} />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      <div className="h-16 md:hidden" />
    </div>
  )
}
