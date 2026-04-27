import Link from 'next/link'

export default function MarketingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-black">S</span>
          </div>
          <span className="font-black text-gray-900 text-lg">supafix</span>
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/preise" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
            Preise
          </Link>
          <Link href="/handwerker/sanitaer" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
            Kategorien
          </Link>
          <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
            Anmelden
          </Link>
          <Link
            href="/auth/register"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
          >
            Kostenlos starten
          </Link>
        </div>

        {/* Mobile CTA */}
        <Link
          href="/customer/new-request"
          className="sm:hidden bg-orange-500 text-white font-semibold text-sm px-3 py-1.5 rounded-lg"
        >
          Starten
        </Link>
      </div>
    </nav>
  )
}
