import Link from 'next/link'
import { Wrench } from 'lucide-react'

export default function AGBPage() {
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
        <h1 className="text-3xl font-black text-gray-900 mb-2">Allgemeine Geschäftsbedingungen</h1>
        <p className="text-gray-500 mb-8">supafix · Stand: April 2026</p>
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">§ 1 Geltungsbereich</h2>
            <p>Diese AGB gelten für die Nutzung der Plattform supafix (supafix.de), betrieben von Hesselmann Beratung UG (haftungsbeschränkt). supafix ist ein Vermittlungsmarktplatz zwischen Kunden (Auftraggeber) und Dienstleistern (Auftragnehmer). supafix schließt selbst keine Werkverträge ab.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">§ 2 Leistungsbeschreibung</h2>
            <p>supafix vermittelt Kontakte zwischen Kunden mit Reparatur-/Dienstleistungsbedarf und geprüften lokalen Dienstleistern. Die Plattform stellt Infrastruktur für Anfragen, Angebote, Kommunikation und Zahlungsabwicklung bereit. Ein Werkvertrag kommt ausschließlich zwischen Kunde und Dienstleister zustande.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">§ 3 Provisionsmodell</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Kunden nutzen supafix kostenlos</li>
              <li>Dienstleister zahlen 10% Provision auf den Auftragswert (zzgl. MwSt.) bei erfolgreich vermittelten Aufträgen</li>
              <li>Premium-Dienstleister (49 €/Monat) zahlen 5% Provision und erhalten bevorzugte Platzierung</li>
              <li>Die Provision wird automatisch bei Zahlungsabwicklung einbehalten</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">§ 4 Escrow-Zahlung</h2>
            <p>Zahlungen werden über Stripe Connect abgewickelt und zunächst treuhänderisch gehalten (Escrow). Die Freigabe an den Dienstleister erfolgt nach Auftragsabschluss und Bestätigung durch den Kunden oder automatisch 72 Stunden nach gemeldeter Fertigstellung ohne Einspruch.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">§ 5 Pflichten der Dienstleister</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vollständige und wahrheitsgemäße Angaben bei Registrierung</li>
              <li>Vorlage gültiger Gewerbeanmeldung auf Anfrage</li>
              <li>Einhaltung aller gesetzlichen Vorschriften (Handwerksordnung, Steuerrecht, Arbeitssicherheit)</li>
              <li>Haftpflichtversicherung mit Deckungssumme ≥ 1 Mio. €</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">§ 6 Haftungsbeschränkung</h2>
            <p>supafix haftet nicht für die Qualität der erbrachten Dienstleistungen, da supafix lediglich als Vermittler auftritt. Bei Schäden durch Dienstleister haftet ausschließlich der jeweilige Dienstleister. supafix unterstützt bei Streitfällen im Rahmen des Dispute-Resolution-Prozesses.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">§ 7 Sperrung &amp; Ausschluss</h2>
            <p>supafix behält sich vor, Nutzer mit einer Bewertung unter 3,5 Sternen oder bei Verstößen gegen diese AGB zu sperren. Dienstleister werden vor Sperrung abgemahnt, außer bei schwerwiegenden Verstößen.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">§ 8 DSA-Transparenz (Digital Services Act)</h2>
            <p>Als Vermittlungsplattform veröffentlicht supafix jährlich einen Transparenzbericht gemäß Art. 15 DSA. Rechtswidrige Inhalte können unter <a href="mailto:legal@supafix.de" className="text-orange-500">legal@supafix.de</a> gemeldet werden. Entscheidungen über Sperrungen erfolgen innerhalb von 14 Tagen mit Begründung.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">§ 9 Anwendbares Recht</h2>
            <p>Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist Duisburg für Verfahren mit Kaufleuten.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
