# FixNow – Setup-Anleitung

## 1. Supabase Projekt anlegen

1. Gehe zu https://supabase.com und erstelle ein neues Projekt
2. Gehe zu **SQL Editor** und führe den gesamten Inhalt von `supabase/schema.sql` aus
3. Gehe zu **Storage** und erstelle einen Bucket namens `request-photos` (Public)
4. Notiere dir **Project URL** und **Anon Key** aus den Projekteinstellungen

## 2. Umgebungsvariablen

Erstelle eine Datei `.env.local` im `fixnow`-Ordner:

```
NEXT_PUBLIC_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

## 3. Abhängigkeiten installieren

```bash
cd fixnow
npm install --legacy-peer-deps
```

## 4. Entwicklungsserver starten

```bash
npm run dev
```

Die App läuft dann auf http://localhost:3000

## 5. Produktions-Build

```bash
npm run build
npm run start
```

---

## Projektstruktur

```
fixnow/
├── app/
│   ├── page.tsx                     # Landing Page
│   ├── auth/
│   │   ├── login/page.tsx           # Login
│   │   ├── register/page.tsx        # Registrierung (Kunde/Dienstleister)
│   │   └── logout/route.ts          # Logout
│   ├── dashboard/page.tsx           # Redirect je nach Rolle
│   ├── customer/
│   │   ├── layout.tsx               # Navigation für Kunden
│   │   ├── dashboard/page.tsx       # Auftragsübersicht
│   │   ├── new-request/page.tsx     # Neuen Auftrag erstellen (3 Schritte)
│   │   └── request/[id]/page.tsx    # Auftrag-Detail + Angebote
│   └── provider/
│       ├── layout.tsx               # Navigation für Dienstleister
│       ├── dashboard/page.tsx       # Feed offener Aufträge
│       ├── request/[id]/page.tsx    # Auftrag ansehen + Angebot abgeben
│       └── profile/page.tsx        # Profil bearbeiten
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser-Client
│   │   └── server.ts               # Server-Client (SSR)
│   └── types.ts                    # TypeScript-Typen
├── middleware.ts                   # Auth-Schutz aller Routen
└── supabase/
    └── schema.sql                  # Vollständiges Datenbankschema
```

## Nächste Schritte (Phase 2)

- [ ] KI-Bildanalyse (OpenAI Vision API) für automatische Kategorisierung
- [ ] Chat zwischen Kunde und Dienstleister (Supabase Realtime)
- [ ] Push-Benachrichtigungen (neue Angebote, Nachrichten)
- [ ] Bewertungssystem nach Auftragsabschluss
- [ ] Stripe Connect für Zahlungen
- [ ] Capacitor für native iOS/Android App
