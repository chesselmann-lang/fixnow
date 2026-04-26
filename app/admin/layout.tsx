import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wrench, LayoutDashboard, Users, ClipboardList, CreditCard, LogOut } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Übersicht' },
    { href: '/admin/users', icon: Users, label: 'Nutzer' },
    { href: '/admin/requests', icon: ClipboardList, label: 'Aufträge' },
    { href: '/admin/payments', icon: CreditCard, label: 'Zahlungen' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col fixed h-full">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-700">
          <Wrench size={18} className="text-orange-400" />
          <span className="font-bold">FixNow Admin</span>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-700">
          <form action="/auth/logout" method="POST">
            <button type="submit" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
              <LogOut size={14} /> Abmelden
            </button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-56 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
