import Link from 'next/link'
import { Wrench, Mic, Camera, Zap, Star, Shield, ChevronRight, MapPin, Clock, CheckCircle, ArrowRight, Droplets, Hammer, KeyRound, PaintBucket, Truck, Leaf, Sparkles, Heart, Monitor } from 'lucide-react'

const categories = [
  { icon: Droplets, name: 'Sanitär', color: 'bg-blue-50 text-blue-600', border: 'hover:border-blue-300' },
  { icon: Zap,      name: 'Elektrik', color: 'bg-yellow-50 text-yellow-600', border: 'hover:border-yellow-300' },
  { icon: Hammer,   name: 'Schreiner', color: 'bg-amber-50 text-amber-700', border: 'hover:border-amber-300' },
  { icon: KeyRound, name: 'Schlüssel', color: 'bg-gray-50 text-gray-600', border: 'hover:border-gray-300' },
  { icon: PaintBucket, name: 'Maler', color: 'bg-purple-50 text-purple-600', border: 'hover:border-purple-300' },
  { icon: Truck,    name: 'Umzug', color: 'bg-green-50 text-green-600', border: 'hover:border-green-300' },
  { icon: Leaf,     name: 'Garten', color: 'bg-emerald-50 text-emerald-600', border: 'hover:border-emerald-300' },
  { icon: Sparkles, name: 'Reinigung', color: 'bg-sky-50 text-sky-600', border: 'hover:border-sky-300' },
  { icon: Heart,    name: 'Pflege', color: 'bg-rose-50 text-rose-600', border: 'hover:border-rose-300' },
  { icon: Monitor,  name: 'IT & Technik', color: 'bg-indigo-50 text-indigo-600', border: 'hover:border-indigo-300' },
]

const steps = [
  { num: '01', icon: Mic, title: 'Anliegen einreichen', desc: 'Sprechen, tippen oder Foto machen — in 30 Sekunden fertig. Unsere KI kategorisiert automatisch.', color: 'bg-orange-500' },
  { num: '02', icon: Zap, title: 'Angebote erhalten', desc: 'Geprüfte Dienstleister in deiner Region sehen die Anfrage sofort und senden Preise + Termine.', color: 'bg-blue-500' },
  { num: '03', icon: Star, title: 'Besten wählen', desc: 'Bewertungen, Preise, Reaktionszeit vergleichen. 1 Klick — Termin gebucht, Zahlung sicher hinterlegt.', color: 'bg-green-500' },
]

const stats = [
  { value: '< 1h', label: 'Ø Zeit bis erstes Angebot' },
  { value: '4.8★', label: 'Ø Kundenbewertung' },
  { value: '100%', label: 'Sichere Escrow-Zahlung' },
]

const providerPerks = [
  { icon: Zap, text: 'Neue Aufträge in Echtzeit — keine teuren Leads kaufen' },
  { icon: MapPin, text: 'Nur Anfragen in deinem PLZ-Radius (5–50 km) ' },
  { icon: Shield, text: 'Verifizierter Badge für mehr Vertrauen & Sichtbarkeit' },
  { icon: Star, text: 'Bewertungsprofil baut sich automatisch auf' },
  { icon: CheckCircle, text: 'Sichere Zahlung via Escrow — kein Mahnwesen' },
  { icon: Clock, text: 'Angebot in 30 Sekunden abgeben' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">supa<span className="text-orange-500">fix</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-gray-500">
            <a href="#how" className="hover:text-gray-900 transition-colors">Wie es funktioniert</a>
            <a href="#categories" className="hover:text-gray-900 transition-colors">Kategorien</a>
            <a href="#provider" className="hover:text-gray-900 transition-colors">Für Dienstleister</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium hidden sm:block">
              Anmelden
            </Link>
            <Link href="/auth/register" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              Kostenlos starten
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-orange-50/30">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-28 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-600 text-sm font-medium px-4 py-1.5 rounded-full mb-8 border border-orange-200">
            <MapPin size={13} />
            Hyperlokal — Dinslaken · Duisburg · Düsseldorf · DACH
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.05] mb-6 tracking-tight">
            Reparatur-Anfrage<br />
            <span className="text-orange-500">in 30 Sekunden.</span><br />
            <span className="text-3xl md:text-5xl font-bold text-gray-600">Angebote in 1 Stunde.</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sprechen, tippen oder Foto machen — supafix leitet dein Anliegen sofort an geprüfte Handwerker in deiner Region weiter.
          </p>

          {/* Input Modes */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link href="/auth/register?flow=request"
              className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5">
              <Mic size={22} />
              Anliegen einreichen
              <ChevronRight size={18} />
            </Link>
            <Link href="/auth/register?role=provider"
              className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-7 py-4 rounded-2xl text-base border border-gray-200 transition-colors">
              Als Dienstleister registrieren
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Input hints */}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Mic size={13} /> Sprachausgabe</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Camera size={13} /> Foto</span>
            <span>·</span>
            <span className="flex items-center gap-1"><CheckCircle size={13} /> Tippen</span>
            <span>·</span>
            <span className="text-green-600 font-medium">Kostenlos für Kunden</span>
          </div>
        </div>

        {/* Decorative blob */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-3 divide-x divide-gray-100">
          {stats.map(s => (
            <div key={s.value} className="text-center px-6">
              <div className="text-3xl font-black text-gray-900 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">So einfach geht's</h2>
          <p className="text-lg text-gray-500">Drei Schritte. Kein Papierkram. Kein Warten.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(step => (
            <div key={step.num} className="relative">
              <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
                <step.icon size={22} className="text-white" />
              </div>
              <div className="text-6xl font-black text-gray-100 absolute top-0 right-0 leading-none select-none">{step.num}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Für jedes Anliegen</h2>
            <p className="text-lg text-gray-500">Handwerk, Haushalt, Garten, Pflege — alles auf einer Plattform</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map(cat => (
              <Link key={cat.name} href="/auth/register?flow=request"
                className={`flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border-2 border-transparent ${cat.border} transition-all hover:shadow-md group`}>
                <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center`}>
                  <cat.icon size={22} />
                </div>
                <span className="text-sm font-semibold text-gray-700 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      <section id="provider" className="max-w-6xl mx-auto px-4 py-24">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 text-sm font-medium px-3 py-1 rounded-full mb-6">
              <Zap size={12} />
              Für Handwerker & Dienstleister
            </div>
            <h2 className="text-4xl font-black text-white mb-5 leading-tight">
              Mehr Aufträge.<br />Weniger Verwaltung.<br /><span className="text-orange-400">Keine teuren Leads.</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              supafix bringt qualifizierte Anfragen direkt zu dir — ohne Kaltakquise, ohne Monatsgebühren für leere Versprechen.
            </p>
            <Link href="/auth/register?role=provider"
              className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-lg">
              Jetzt kostenlos registrieren
              <ChevronRight size={20} />
            </Link>
            <p className="text-gray-500 text-sm mt-3">Kostenlos starten · 10% Fee nur bei Abschluss · Kein Abo</p>
          </div>

          <div className="flex-1 grid grid-cols-1 gap-4 w-full">
            {providerPerks.map(p => (
              <div key={p.text} className="flex items-start gap-4 text-gray-300">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <p.icon size={15} className="text-orange-400" />
                </div>
                <span className="text-sm leading-relaxed">{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Differenzierung vs MyHammer */}
      <section className="bg-orange-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Warum supafix?</h2>
          <p className="text-gray-500 mb-10">Nicht noch ein Anzeigenportal — ein echter Matching-Dienst.</p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { title: 'Voice-First', desc: 'Einfach reinreden statt langen Formularen. Für alle Altersgruppen.' },
              { title: 'KI-Klassifikation', desc: 'Das richtige Gewerk wird automatisch erkannt — du musst nichts wissen.' },
              { title: 'Escrow-Zahlung', desc: 'Geld wird erst nach Abschluss freigegeben. Sicherheit für beide Seiten.' },
              { title: 'Hyperlokal', desc: 'Fokus auf Dinslaken, Duisburg, Düsseldorf — persönlich statt anonym.' },
              { title: 'Echte Bewertungen', desc: 'Reaktionszeit, Abschlussquote, Foto-Beispiele — volle Transparenz.' },
              { title: 'WhatsApp-Bridge', desc: 'Anfrage per WhatsApp senden — demnächst verfügbar.' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center">
                  <Wrench size={15} className="text-white" />
                </div>
                <span className="font-bold text-white text-lg">supa<span className="text-orange-500">fix</span></span>
              </div>
              <p className="text-sm">Reparatur in Stunden statt Wochen.</p>
            </div>
            <div className="flex gap-8 text-sm">
              <div>
                <div className="font-semibold text-white mb-3">Plattform</div>
                <div className="space-y-2">
                  <div><Link href="/auth/register" className="hover:text-white transition-colors">Jetzt starten</Link></div>
                  <div><Link href="/auth/login" className="hover:text-white transition-colors">Anmelden</Link></div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-white mb-3">Rechtliches</div>
                <div className="space-y-2">
                  <div><Link href="/impressum" className="hover:text-white transition-colors">Impressum</Link></div>
                  <div><Link href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link></div>
                  <div><Link href="/agb" className="hover:text-white transition-colors">AGB</Link></div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-xs text-center">
            © {new Date().getFullYear()} supafix · Hesselmann Beratung UG · Dinslaken · All rights reserved
          </div>
        </div>
      </footer>
    </div>
  )
}
