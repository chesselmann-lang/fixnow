import Link from 'next/link'
import { Wrench, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-7xl mb-4">🔧</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-500 mb-8">Diese Seite konnte nicht gefunden werden.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors">
          <ArrowLeft size={16} /> Zurück zur Startseite
        </Link>
      </div>
    </div>
  )
}
