import Link from 'next/link'
import { Wrench } from 'lucide-react'

export default function ImpressumPage() {
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
        <h1 className="text-3xl font-black text-gray-900 mb-8">Impressum</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-900 mb-2">Angaben gemäß § 5 TMG</h2>
            <p>Hesselmann Beratung UG (haftungsbeschränkt)<br />
            Inhaber: Christian Hesselmann<br />
            Dinslaken, Deutschland</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">Kontakt</h2>
            <p>E-Mail: <a href="mailto:hallo@hesselmann-service.de" className="text-orange-500 hover:underline">hallo@hesselmann-service.de</a></p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">Handelsregister</h2>
            <p>Eingetragen beim Amtsgericht Duisburg<br />
            HRB: (wird nachgereicht nach Eintragung)</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">Umsatzsteuer-ID</h2>
            <p>USt-IdNr. gemäß § 27a UStG: (wird nach Zuteilung ergänzt)</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">Verantwortlich für den Inhalt (§ 55 Abs. 2 RStV)</h2>
            <p>Christian Hesselmann, Dinslaken</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">EU-Streitschlichtung</h2>
            <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener" className="text-orange-500 hover:underline ml-1">https://ec.europa.eu/consumers/odr/</a>.
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">Hosting</h2>
            <p>supafix.de wird gehostet von:<br />
            Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA<br />
            Datenschutzerklärung Vercel: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener" className="text-orange-500 hover:underline">vercel.com/legal/privacy-policy</a></p>
          </section>
        </div>
      </main>
    </div>
  )
}
