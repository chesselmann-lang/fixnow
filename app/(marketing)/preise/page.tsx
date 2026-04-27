import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, XCircle, ArrowRight, Shield, Zap, Star, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Preise & Konditionen — supafix',
  description: 'Für Kunden komplett kostenlos. Dienstleister zahlen nur 10 % Provision bei erfolgreicher Buchung. Keine Monatsgebühren, kein Abo.',
  openGraph: {
    title: 'Preise — supafix ist für Kunden kostenlos',
    description: 'Keine versteckten Kosten. Nur 10 % Provision für Dienstleister bei erfolgreicher Buchung.',
  },
}

const FAQS = [
  {
    q: 'Ist supafix wirklich kostenlos für Kunden?',
    a: 'Ja, vollständig. Anfragen erstellen, Angebote vergleichen und Dienstleister buchen — alles gratis. supafix verdient nur an der 10 %-Provision auf erfolgreiche Buchungen.',
  },
  {
    q: 'Wann wird die Provision fällig?',
    a: 'Nur wenn ein Auftrag erfolgreich abgeschlossen wird. Kein Abonnement, keine Grundgebühr, keine Kosten für Angebote die nicht angenommen werden.',
  },
  {
    q: 'Wie funktioniert die sichere Zahlung?',
    a: 'Der Kunde zahlt per Karte oder SEPA. Das Geld wird treuhänderisch via Stripe gehalten und nach Auftragsabschluss automatisch ausgezahlt — abzüglich der 10 % Plattformgebühr.',
  },
  {
    q: 'Kann ich als Dienstleister kostenlos testen?',
    a: 'Ja. Die Registrierung und das Anlegen eines Profils sind kostenlos. Du zahlst erst wenn du tatsächlich einen Auftrag gewonnen und abgeschlossen hast.',
  },
  {
    q: 'Gibt es ein Limit für Angebote?',
    a: 'Nein. Du kannst so viele Angebote abgeben wie du möchtest — ohne Extrakosten.',
  },
  {
    q: 'Was passiert wenn ein Auftrag storniert wird?',
    a: 'Wird ein Auftrag vor Beginn storniert, wird die Zahlung vollständig zurückerstattet. Keine Provision fällig.',
  },
  {
    q: 'Wie schnell bekomme ich mein Geld?',
    a: 'Stripe überweist den Nettobetrag nach Auftragsabschluss in der Regel innerhalb von 2–7 Werktagen auf dein Bankkonto.',
  },
]

export default function PreisePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-6">
            <Zap size={14} />
            Transparente Preise — keine versteckten Kosten
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Einfach. Fair. Erfolgsorientiert.
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Kunden zahlen nichts. Dienstleister zahlen nur bei Erfolg.
            Kein Abo, keine Grundgebühr, keine bösen Überraschungen.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Kunden — kostenlos */}
          <div className="bg-white rounded-3xl shadow-sm p-8 border-2 border-transparent">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
              <span className="text-2xl">🔍</span>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-1">Für Kunden</h2>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-5xl font-black text-gray-900">0 €</span>
              <span className="text-gray-400 mb-2">/ immer</span>
            </div>
            <div className="space-y-3 mb-8">
              {[
                'Auftrag erstellen in 30 Sekunden',
                'Bis zu 5 Angebote vergleichen',
                'Dienstleister-Bewertungen lesen',
                'Sicherer Escrow-Schutz',
                'Echtzeit-Chat mit Anbietern',
                'Fotos & KI-Analyse einreichen',
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-green-500 shrink-0" />
                  <span className="text-gray-700 text-sm">{f}</span>
                </div>
              ))}
            </div>
            <Link
              href="/auth/register?role=customer"
              className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-2xl transition-colors"
            >
              Kostenlos registrieren
            </Link>
          </div>

          {/* Dienstleister — 10% */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
              Beliebteste Wahl
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
              <span className="text-2xl">🔧</span>
            </div>
            <h2 className="text-xl font-black mb-1">Für Dienstleister</h2>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-5xl font-black">10 %</span>
              <span className="text-orange-100 mb-2">/ Auftrag</span>
            </div>
            <p className="text-orange-100 text-sm mb-6">Nur bei erfolgreicher Buchung</p>
            <div className="space-y-3 mb-8">
              {[
                { ok: true, text: 'Profil & Kategorien kostenlos anlegen' },
                { ok: true, text: 'Unbegrenzt Angebote abgeben' },
                { ok: true, text: 'KI-gesteuerter Auto-Bid Bot' },
                { ok: true, text: 'Echtzeit-Push für neue Aufträge' },
                { ok: true, text: 'Stripe-Auszahlung in 2–7 Tagen' },
                { ok: true, text: 'Bewertungen & Profil-Sichtbarkeit' },
                { ok: false, text: 'Keine Monatsgebühr' },
                { ok: false, text: 'Kein Abo, kein Risiko' },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-3">
                  {f.ok
                    ? <CheckCircle size={16} className="text-white shrink-0" />
                    : <XCircle size={16} className="text-white/40 shrink-0" />}
                  <span className={`text-sm ${f.ok ? 'text-white' : 'text-white/50 line-through'}`}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/auth/register?role=provider"
              className="block w-full text-center bg-white text-orange-600 font-bold py-3.5 rounded-2xl hover:bg-orange-50 transition-colors"
            >
              Kostenlos starten <ArrowRight className="inline ml-1" size={16} />
            </Link>
          </div>
        </div>

        {/* Comparison — vs MyHammer */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">
            supafix vs. die Konkurrenz
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Merkmal</th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-orange-500 font-black text-sm">supafix</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-gray-400 font-semibold text-sm">MyHammer</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-gray-400 font-semibold text-sm">Aroundhome</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ['Für Kunden kostenlos', true, true, true],
                  ['Keine Monatsgebühr Anbieter', true, false, false],
                  ['Nur Provision bei Erfolg', true, false, false],
                  ['Echtzeit-Angebote (< 1 Std.)', true, false, false],
                  ['Escrow-Zahlungsschutz', true, false, false],
                  ['Push-Notifications', true, false, false],
                  ['KI-Bildanalyse', true, false, false],
                  ['DACH-Region', true, true, true],
                ].map(([label, s, m, a]) => (
                  <tr key={label as string} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5 text-sm text-gray-700">{label as string}</td>
                    {[s, m, a].map((v, i) => (
                      <td key={i} className="px-6 py-3.5 text-center">
                        {v
                          ? <CheckCircle size={18} className={`mx-auto ${i === 0 ? 'text-orange-500' : 'text-green-400'}`} />
                          : <XCircle size={18} className="mx-auto text-gray-200" />
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Shield, title: 'Escrow-Schutz', desc: 'Zahlung sicher bis Job erledigt' },
            { icon: Star,   title: 'Geprüfte Anbieter', desc: 'Bewertungen von echten Kunden' },
            { icon: Zap,    title: 'Angebote in 1 Std.', desc: 'Schnellste Reaktionszeit im Markt' },
          ].map(b => (
            <div key={b.title} className="bg-white rounded-2xl p-5 shadow-sm">
              <b.icon size={22} className="text-orange-500 mx-auto mb-2" />
              <p className="font-bold text-gray-900 text-sm">{b.title}</p>
              <p className="text-xs text-gray-400 mt-1">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">
            Häufige Fragen zu den Preisen
          </h2>
          <div className="space-y-4">
            {FAQS.map(faq => (
              <div key={faq.q} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <HelpCircle size={18} className="text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 mb-2">{faq.q}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-black mb-3">Bereit loszulegen?</h2>
          <p className="text-orange-100 text-lg mb-8">
            Starte kostenlos — egal ob Kunde oder Dienstleister.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/customer/new-request"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-colors"
            >
              Als Kunde anfragen <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/register?role=provider"
              className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 rounded-2xl transition-colors"
            >
              Als Dienstleister registrieren
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
