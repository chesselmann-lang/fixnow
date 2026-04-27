import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Star, Shield, Clock, CheckCircle } from 'lucide-react'

// Static category pages for SEO
const CATEGORIES: Record<string, {
  title: string; emoji: string; desc: string; keywords: string[]
  services: string[]; avgPrice: string; faqs: Array<{ q: string; a: string }>
}> = {
  sanitaer: {
    title: 'Sanitär & Klempner',
    emoji: '🚿',
    desc: 'Rohrbruch, verstopfte Abflüsse, Badezimmer-Renovierung – qualifizierte Sanitärbetriebe in deiner Nähe.',
    keywords: ['Klempner', 'Sanitär', 'Rohrbruch', 'Heizung', 'Badezimmer'],
    services: ['Rohrbruch beheben', 'Abfluss entstopfen', 'Wasserhahn reparieren', 'Dusche montieren', 'Heizung warten'],
    avgPrice: '80–250 €',
    faqs: [
      { q: 'Wie schnell kommt ein Sanitärbetrieb?', a: 'Bei Notfällen meist innerhalb von 1–4 Stunden. Standard-Jobs werden oft am selben oder nächsten Tag erledigt.' },
      { q: 'Was kostet eine Stunde Klempner?', a: 'Im DACH-Raum typischerweise 60–100 €/Stunde, je nach Region und Spezialisierung.' },
    ],
  },
  elektrik: {
    title: 'Elektriker',
    emoji: '⚡',
    desc: 'Steckdosen, Sicherungskasten, Smart Home – geprüfte Elektriker für Haus und Wohnung.',
    keywords: ['Elektriker', 'Steckdose', 'Sicherungskasten', 'Smart Home', 'Licht'],
    services: ['Steckdose installieren', 'Sicherungskasten tauschen', 'Lampe montieren', 'Smart Home einrichten', 'Kabel verlegen'],
    avgPrice: '90–300 €',
    faqs: [
      { q: 'Muss ein Elektriker zugelassen sein?', a: 'Ja – für Arbeiten am Stromnetz ist ein zugelassener Meisterbetrieb gesetzlich vorgeschrieben. Alle supafix-Elektriker sind geprüft.' },
      { q: 'Was kostet eine einfache Steckdose?', a: 'Montage inkl. Material typischerweise 80–150 €.' },
    ],
  },
  reinigung: {
    title: 'Reinigung & Haushalt',
    emoji: '🧹',
    desc: 'Fensterputzen, Entrümpeln, Umzugsreinigung – zuverlässige Reinigungskräfte auf Abruf.',
    keywords: ['Reinigung', 'Putzhilfe', 'Fenster putzen', 'Entrümpelung', 'Umzug'],
    services: ['Grundreinigung', 'Fenster reinigen', 'Umzugsreinigung', 'Teppich reinigen', 'Entrümpeln'],
    avgPrice: '60–200 €',
    faqs: [
      { q: 'Wie schnell kann jemand kommen?', a: 'Viele Dienstleister sind innerhalb von 24–48 Stunden verfügbar.' },
      { q: 'Muss ich selbst Reinigungsmittel stellen?', a: 'Das klärst du direkt mit dem Dienstleister – viele bringen ihr eigenes Material mit.' },
    ],
  },
  umzug: {
    title: 'Umzug & Transport',
    emoji: '📦',
    desc: 'Umzugshelfer, Möbelmontage, Transportfahrten – günstig und zuverlässig im ganzen DACH-Raum.',
    keywords: ['Umzug', 'Umzugshelfer', 'Möbelmontage', 'Transport', 'Möbel tragen'],
    services: ['Umzug komplett', 'Einzel-Transport', 'Möbel auf- & abbauen', 'Einlagerung', 'Sperrmüll entsorgen'],
    avgPrice: '150–600 €',
    faqs: [
      { q: 'Wie früh muss ich buchen?', a: 'Für Wochenend-Umzüge 2–3 Wochen im Voraus empfohlen. Kurzfristig oft möglich unter der Woche.' },
      { q: 'Sind Gegenstände versichert?', a: 'Professionelle Umzugsunternehmen haben Haftpflichtversicherung. Details im Angebot klären.' },
    ],
  },
  maler: {
    title: 'Maler & Lackierer',
    emoji: '🎨',
    desc: 'Wände streichen, Tapeten kleben, Fassaden – erfahrene Maler für innen und außen.',
    keywords: ['Maler', 'Wände streichen', 'Tapezieren', 'Fassade', 'Lackieren'],
    services: ['Wände streichen', 'Tapeten kleben', 'Fassade renovieren', 'Decke weißen', 'Heizkörper lackieren'],
    avgPrice: '200–800 €',
    faqs: [
      { q: 'Wie lange dauert eine Zimmerrenovierung?', a: 'Ein durchschnittliches Zimmer (30 m²) nimmt 1–2 Tage in Anspruch.' },
      { q: 'Sind Farben im Preis enthalten?', a: 'Das variiert – klär das im Angebot. Viele Maler stellen Material separat in Rechnung.' },
    ],
  },
  garten: {
    title: 'Garten & Außenanlagen',
    emoji: '🌿',
    desc: 'Rasenmähen, Hecke schneiden, Gartengestaltung – Profis für deinen Garten.',
    keywords: ['Garten', 'Rasenmähen', 'Hecke schneiden', 'Gartengestaltung', 'Baum fällen'],
    services: ['Rasen mähen', 'Hecke schneiden', 'Baumfällung', 'Gartengestaltung', 'Pflanzenpflege'],
    avgPrice: '80–400 €',
    faqs: [
      { q: 'Wie oft soll der Rasen gemäht werden?', a: 'In der Wachstumsphase (April–Oktober) etwa alle 1–2 Wochen.' },
      { q: 'Brauche ich eine Genehmigung zum Bäume fällen?', a: 'In vielen Kommunen ja – frag beim Ordnungsamt. Gute Gärtner kennen die lokalen Regeln.' },
    ],
  },
}

type Props = { params: Promise<{ kategorie: string }> }

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map(k => ({ kategorie: k }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategorie } = await params
  const cat = CATEGORIES[kategorie]
  if (!cat) return {}
  return {
    title: `${cat.emoji} ${cat.title} buchen — supafix`,
    description: cat.desc,
    keywords: [...cat.keywords, 'supafix', 'buchen', 'Angebot vergleichen'],
    openGraph: {
      title: `${cat.title} buchen — Preise vergleichen auf supafix`,
      description: cat.desc,
      url: `https://supafix.de/handwerker/${kategorie}`,
      type: 'website',
    },
  }
}

export default async function KategoriePage({ params }: Props) {
  const { kategorie } = await params
  const cat = CATEGORIES[kategorie]
  if (!cat) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: cat.title,
    description: cat.desc,
    provider: { '@type': 'Organization', name: 'supafix', url: 'https://supafix.de' },
    areaServed: { '@type': 'Country', name: 'DE' },
    offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', description: `Typischer Preisbereich: ${cat.avgPrice}` },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white py-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-5xl mb-4">{cat.emoji}</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">{cat.title} buchen</h1>
            <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">{cat.desc}</p>
            <Link
              href={`/customer/new-request?category=${kategorie}`}
              className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Kostenlos anfragen <ArrowRight size={20} />
            </Link>
            <p className="text-orange-200 text-sm mt-3">In 30 Sekunden · Kostenlos · Bis zu 5 Angebote</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Clock,  label: 'Angebote in', value: '< 1 Std.' },
              { icon: Star,   label: 'Ø Bewertung', value: '4.8 ★' },
              { icon: Shield, label: 'Zahlung',      value: 'Sicher' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <s.icon size={20} className="text-orange-500 mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Services */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Typische Leistungen</h2>
            <div className="grid grid-cols-1 gap-2">
              {cat.services.map(s => (
                <div key={s} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <CheckCircle size={18} className="text-green-500 shrink-0" />
                  <span className="text-gray-700 font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Avg price */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
            <p className="text-sm font-semibold text-orange-700 mb-1">Typischer Preisbereich</p>
            <p className="text-3xl font-black text-gray-900">{cat.avgPrice}</p>
            <p className="text-sm text-gray-500 mt-1">Vergleiche echte Angebote — kostenlos und unverbindlich</p>
          </div>

          {/* How it works */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">So funktioniert's</h2>
            <div className="space-y-3">
              {[
                { n: '1', t: 'Auftrag beschreiben', d: '30 Sekunden — Fotos optional' },
                { n: '2', t: 'Angebote vergleichen', d: 'Bis zu 5 Angebote in 1 Stunde' },
                { n: '3', t: 'Buchen & bezahlen', d: 'Zahlung sicher hinterlegt bis Job erledigt' },
              ].map(step => (
                <div key={step.n} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    {step.n}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{step.t}</p>
                    <p className="text-sm text-gray-400">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Häufige Fragen</h2>
            <div className="space-y-3">
              {cat.faqs.map(faq => (
                <div key={faq.q} className="bg-white rounded-xl p-5 shadow-sm">
                  <p className="font-semibold text-gray-900 mb-2">{faq.q}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pb-6">
            <Link
              href={`/customer/new-request?category=${kategorie}`}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-md transition-all hover:-translate-y-0.5"
            >
              Jetzt {cat.title} anfragen <ArrowRight size={20} />
            </Link>
            <p className="text-gray-400 text-sm mt-3">Kostenlos · Unverbindlich · 30 Sekunden</p>
          </div>
        </div>
      </div>
    </>
  )
}
