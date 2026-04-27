import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from '@/components/PostHogProvider'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'supafix – Reparatur in Stunden statt Wochen',
  description: 'Handwerker & Dienstleister in deiner Region. Anfrage in 30 Sekunden, Angebote in 1 Stunde. Kostenlos für Kunden.',
  keywords: 'Handwerker, Reparatur, Sanitär, Elektrik, Garten, Dinslaken, Duisburg, Düsseldorf',
  metadataBase: new URL('https://supafix.de'),
  openGraph: {
    title: 'supafix – Reparatur in Stunden statt Wochen',
    description: 'Anfrage in 30 Sekunden. Angebote in 1 Stunde. Termin morgen.',
    url: 'https://supafix.de',
    siteName: 'supafix',
    locale: 'de_DE',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={geist.className}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
