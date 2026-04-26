import Link from 'next/link'
import { Wrench, Camera, Zap, Star, ChevronRight, Droplets, Hammer, KeyRound, PaintBucket, Truck, Leaf, Sparkles } from 'lucide-react'

const features = [
  { icon: Camera, title: 'Foto machen', desc: 'Einfach fotografieren und Problem beschreiben – in 30 Sekunden erledigt.' },
  { icon: Zap, title: 'Sofort Angebote', desc: 'Lokale Dienstleister sehen deine Anfrage in Echtzeit und melden sich direkt.' },
  { icon: Star, title: 'Bewertungen & Preise', desc: 'Vergleiche Angebote, Bewertungen und wähle den Besten für dich.' },
]

const categories = [
  { icon: Droplets, name: 'Sanitär', color: 'bg-blue-100 text-blue-600' },
  { icon: Zap, name: 'Elektrik', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Hammer, name: 'Schreiner', color: 'bg-amber-100 text-amber-700' },
  { icon: KeyRound, name: 'Schlüsseldienst', color: 'bg-gray-100 text-gray-600' },
  { icon: PaintBucket, name: 'Maler', color: 'bg-purple-100 text-purple-600' },
  { icon: Truck, name: 'Umzug', color: 'bg-green-100 text-green-600' },
  { icon: Leaf, name: 'Garten', color: 'bg-emerald-100 text-emerald-600' },
  { icon: Sparkles, name: 'Reinigung', color: 'bg-sky-100 text-sky-600' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
            <Wrench size={24} />
            FixNow
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#how" className="hover:text-gray-900">So funktioniert's</a>
            <a href="#categories" className="hover:text-gray-900">Kategorien</a>
            <a href="#provider" className="hover:text-gray-900">Für Dienstleister</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Anmelden
            </Link>
            <Link
              href="/auth/register"
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
            >
              Kostenlos starten
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Zap size={14} />
          Dienstleister melden sich in Minuten
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Problem? Foto rein.<br />
          <span className="text-orange-500">Hilfe sofort.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Egal ob tropfender Wasserhahn, kaputtes Fenster oder Umzugshilfe — fotografiere das Problem, beschreibe es kurz und erhalte innerhalb von Minuten echte Angebote von lokalen Profis.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-colors"
          >
            Jetzt Auftrag erstellen
            <ChevronRight size={20} />
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-lg px-8 py-4 rounded-2xl transition-colors"
          >
            Als Dienstleister registrieren
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 pt-10 border-t border-gray-100">
          {[
            { value: '< 5 Min', label: 'Ø Reaktionszeit' },
            { value: '3+', label: 'Angebote pro Auftrag' },
            { value: '100%', label: 'Kostenlos für Kunden' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Kategorien */}
      <section id="categories" className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Alle Kategorien</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link key={cat.name} href="/auth/register">
                <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                    <cat.icon size={22} />
                  </div>
                  <span className="font-medium text-gray-700 text-sm">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* So funktioniert's */}
      <section id="how" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">So einfach geht's</h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            In 3 Schritten zum passenden Dienstleister – schneller als eine Google-Suche.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={f.title} className="relative">
                <div className="bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  {i + 1}
                </div>
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Für Dienstleister */}
      <section id="provider" className="bg-orange-500 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Du bist Dienstleister?</h2>
          <p className="text-orange-100 text-lg max-w-xl mx-auto mb-8">
            Erhalte täglich neue Aufträge direkt in deiner Region. Kein Kaltakquise, kein Aufwand – einfach Angebot abgeben und loslegen.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-orange-500 font-semibold text-lg px-8 py-4 rounded-2xl hover:bg-orange-50 transition-colors"
          >
            Jetzt als Dienstleister registrieren
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Wrench size={18} className="text-orange-400" />
            FixNow
          </div>
          <p className="text-sm">© 2026 FixNow. Alle Rechte vorbehalten.</p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white">Datenschutz</a>
            <a href="#" className="hover:text-white">Impressum</a>
            <a href="#" className="hover:text-white">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
