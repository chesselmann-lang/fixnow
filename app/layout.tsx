import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'supafix – Reparatur in Stunden statt Wochen',
  description: 'Handwerker & Dienstleister in deiner Region. Anfrage in 30 Sekunden, Angebote in 1 Stunde. Kostenlos für Kunden.',
  keywords: 'Handwerker, Reparatur, Sanitär, Elektrik, Garten, Dinslaken, Duisburg, Düsseldorf, DACH',
  openGraph: {
    title: 'supafix – Reparatur in Stunden statt Wochen',
    description: 'Anfrage in 30 Sekunden. Angebote in 1 Stunde. Termin morgen.',
    url: 'https://supafix.de',
    siteName: 'supafix',
    locale: 'de_DE',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={geist.className}>{children}</body>
    </html>
  )
}
