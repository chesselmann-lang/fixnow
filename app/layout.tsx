import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from '@/components/PostHogProvider'
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar'

const geist = Geist({ subsets: ['latin'] })

const SITE_URL = 'https://supafix.de'
const TITLE    = 'supafix – Handwerker & Dienstleister in Minuten buchen'
const DESC     = 'Kostenlose Anfrage in 30 Sekunden. Bis zu 5 Angebote in 1 Stunde. Vergleiche Preise, wähle den Besten – Zahlung sicher hinterlegt bis der Job erledigt ist.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | supafix',
  },
  description: DESC,
  keywords: [
    'Handwerker', 'Dienstleister', 'Reparatur', 'Sanitär', 'Elektrik', 'Maler',
    'Umzug', 'Garten', 'Reinigung', 'DACH', 'Deutschland', 'Österreich', 'Schweiz',
    'Handwerker buchen', 'Preisvergleich Handwerker', 'MyHammer Alternative',
  ],
  authors: [{ name: 'supafix', url: SITE_URL }],
  creator: 'supafix',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE_URL,
    siteName: 'supafix',
    locale: 'de_DE',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'supafix – Handwerker & Dienstleister buchen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
}

// JSON-LD: Service Marketplace schema.org
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'supafix',
  url: SITE_URL,
  description: DESC,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'supafix',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icon-192.png`,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={geist.className}>
        <PostHogProvider>
          <ServiceWorkerRegistrar />
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
