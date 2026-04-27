// Dynamic OG image generation via Next.js ImageResponse
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48,
          }}>🔧</div>
          <div style={{ color: 'white', fontSize: 64, fontWeight: 900, letterSpacing: -2 }}>
            supafix
          </div>
        </div>

        {/* Tagline */}
        <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: 32, fontWeight: 700, textAlign: 'center', maxWidth: 800, lineHeight: 1.3 }}>
          Handwerker & Dienstleister in Minuten buchen
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 40, marginTop: 48 }}>
          {[
            { label: '30 Sek.', desc: 'Anfrage erstellen' },
            { label: '< 1 Std.', desc: 'Angebote erhalten' },
            { label: '0 €', desc: 'Für Kunden' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 16, padding: '16px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column',
            }}>
              <span style={{ color: 'white', fontSize: 28, fontWeight: 900 }}>{s.label}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>{s.desc}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20, marginTop: 40, fontWeight: 600 }}>
          supafix.de
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
