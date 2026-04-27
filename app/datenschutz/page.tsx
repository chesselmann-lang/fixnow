import Link from 'next/link'
import { Wrench } from 'lucide-react'

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench size={15} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">supa<span className="text-orange-500">fix</span></span>
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Datenschutzerklärung</h1>
        <p className="text-gray-500 mb-8">Stand: April 2026 · gem. DSGVO, TDDDG</p>
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8 text-gray-700 leading-relaxed text-sm">

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">1. Verantwortlicher</h2>
            <p>Hesselmann Beratung UG (haftungsbeschränkt), Christian Hesselmann, Dinslaken.<br />
            E-Mail: <a href="mailto:hallo@hesselmann-service.de" className="text-orange-500">hallo@hesselmann-service.de</a></p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">2. Erhobene Daten &amp; Zwecke</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong>Registrierungsdaten</strong> (Name, E-Mail, Passwort-Hash): Vertragserfüllung gem. Art. 6 Abs. 1 lit. b DSGVO</li>
              <li><strong>Standortdaten</strong> (PLZ, Stadt): Vermittlung lokaler Dienstleister, Vertragserfüllung</li>
              <li><strong>Fotos &amp; Sprachaufnahmen</strong> der Auftragsanfragen: KI-gestützte Klassifikation, Vertragserfüllung</li>
              <li><strong>Zahlungsdaten</strong>: Verarbeitung über Stripe Inc., Vertragserfüllung</li>
              <li><strong>Server-Logs</strong> (IP, Zeitstempel, User-Agent): Berechtigtes Interesse gem. Art. 6 Abs. 1 lit. f DSGVO (Sicherheit)</li>
              <li><strong>Nutzungsanalyse</strong> (PostHog, pseudonymisiert): Berechtigtes Interesse (Produktverbesserung)</li>
              <li><strong>Fehlermonitoring</strong> (Sentry, pseudonymisiert): Berechtigtes Interesse (Stabilität)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">3. Weitergabe an Dritte</h2>
            <p>Daten werden nur weitergegeben soweit zur Vertragserfüllung notwendig:</p>
            <ul className="space-y-1 list-disc pl-5 mt-2">
              <li>Supabase Inc. (Datenbankhosting, USA) – EU-Standardvertragsklauseln</li>
              <li>Stripe Inc. (Zahlungsabwicklung, USA) – EU-Standardvertragsklauseln</li>
              <li>Vercel Inc. (Hosting, USA) – EU-Standardvertragsklauseln</li>
              <li>OpenAI LLC (KI-Analyse, optional) – EU-Standardvertragsklauseln</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">4. Speicherdauer</h2>
            <p>Daten werden gelöscht, sobald der Verarbeitungszweck entfällt und keine gesetzlichen Aufbewahrungspflichten bestehen (§ 257 HGB: 6 Jahre, § 147 AO: 10 Jahre für Buchungsbelege).</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">5. Ihre Rechte (Art. 15–22 DSGVO)</h2>
            <ul className="space-y-1 list-disc pl-5">
              <li>Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen Verarbeitung (Art. 21 DSGVO)</li>
              <li>Widerruf erteilter Einwilligungen</li>
            </ul>
            <p className="mt-2">Anfragen: <a href="mailto:hallo@hesselmann-service.de" className="text-orange-500">hallo@hesselmann-service.de</a> · Beschwerden: Landesbeauftragte für Datenschutz NRW</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">6. Cookies</h2>
            <p>supafix verwendet ausschließlich technisch notwendige Session-Cookies für die Authentifizierung. Es werden keine Tracking-Cookies ohne Einwilligung gesetzt.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">7. KI-gestützte Entscheidungen</h2>
            <p>Die KI-Klassifikation von Anfragen dient ausschließlich der Kategorisierung und Weiterleitung. Es finden keine automatisierten Entscheidungen mit rechtlichen Folgewirkungen statt (Art. 22 DSGVO).</p>
          </section>
        </div>
      </main>
    </div>
  )
}
