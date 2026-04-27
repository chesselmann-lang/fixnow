# 🚀 supafix — Launch Checklist

**Prod URL:** https://fixnow-o60upvwoa-mindry.vercel.app (bis DNS fertig)  
**Ziel-Domain:** https://supafix.de  
**GitHub:** https://github.com/chesselmann-lang/fixnow  
**Supabase Projekt:** wkmhcvtpgscxzftyzmpd  
**Vercel Projekt:** prj_pw2qnrkxwB1ATUJquvm3UfebUAnJ  

---

## 1. DNS — supafix.de → Vercel

In Mittwald mStudio (oder wo auch immer supafix.de gehosted wird):

| Typ | Name | Wert |
|-----|------|------|
| A   | @    | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

In Vercel Dashboard → Project → Settings → Domains:
- Domain `supafix.de` hinzufügen
- Domain `www.supafix.de` hinzufügen

---

## 2. Supabase — SQL Migrations ausführen

Dashboard: https://supabase.com/dashboard/project/wkmhcvtpgscxzftyzmpd/sql/new

Reihenfolge:
- [ ] `supabase/schema.sql` (Basis — falls noch nicht ausgeführt)
- [ ] `supabase/schema_v2.sql`
- [ ] `supabase/schema_v4_stripe.sql`
- [ ] `supabase/schema_v5_reviews.sql`
- [ ] `supabase/schema_v6_referral.sql` ← enthält auch push_subscriptions

---

## 3. Vercel — Environment Variables

Dashboard: https://vercel.com/mindry/fixnow/settings/environment-variables

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://wkmhcvtpgscxzftyzmpd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<von Supabase Dashboard>
SUPABASE_SERVICE_ROLE_KEY=<von Supabase Dashboard → Settings → API>
```

### Stripe
```
STRIPE_SECRET_KEY=sk_live_...         (oder sk_test_ zum Testen)
STRIPE_WEBHOOK_SECRET=whsec_...       (nach Webhook-Erstellung)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_CLIENT_ID=ca_...               (Stripe Connect → Settings)
```

### VAPID (Web Push — bereits generiert)
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJlcrw2BleBVab-BsMG_c75kWEX3p3Xc7OJiSgyKReYfpBa3flXNCUvYEdUJ0wFHesSbcJ2l5cAqO9IeVtu7BIU
VAPID_PRIVATE_KEY=ucjcxMickXXlaqJNiCEnxn2e7RAsgLtQiTAbMOaSMt4
```

### Optional (Nicht zwingend für Launch)
```
OPENAI_API_KEY=sk-...                 (KI-Bildanalyse + Auto-Bid)
TWILIO_ACCOUNT_SID=AC...              (SMS-Verifizierung)
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=VA...
MAPBOX_TOKEN=pk.eyJ1...               (Kartenvorschau in Auftragsformular)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
NEXT_PUBLIC_POSTHOG_KEY=phc_...       (Analytics)
NEXT_PUBLIC_SENTRY_DSN=https://...    (Error Tracking)
```

---

## 4. Stripe Setup

### 4a. Stripe Connect aktivieren
- Dashboard → Connect → Settings
- Platform: "Custom" oder "Express"
- Webhook für Connect-Events einrichten

### 4b. Webhook erstellen
Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://supafix.de/api/stripe/webhook`
- Events: `payment_intent.succeeded`, `account.updated`
- Webhook Secret → `STRIPE_WEBHOOK_SECRET` in Vercel

### 4c. Test-Zahlung durchführen
- Testdaten: Karte `4242 4242 4242 4242`, Datum beliebig, CVC `123`

---

## 5. Resend — E-Mail Notifications

1. Account erstellen: https://resend.com
2. Domain `supafix.de` verifizieren (DNS TXT-Record)
3. API Key erstellen → in Vercel als `RESEND_API_KEY=re_...`

---

## 6. Supabase Edge Functions deployen

```bash
cd /path/to/fixnow
npx supabase login   # Management API Token von supabase.com/dashboard/account/tokens
./scripts/deploy-edge-functions.sh
```

Deployed werden:
- `auto-bid` — KI-gesteuerter Auto-Angebots-Bot
- `send-notification` — E-Mail bei neuen Angeboten / Akzeptierung
- `notify-providers` — Web Push bei neuen Aufträgen

### Supabase Secrets setzen:
```bash
npx supabase secrets set RESEND_API_KEY=re_xxx --project-ref wkmhcvtpgscxzftyzmpd
npx supabase secrets set APP_URL=https://supafix.de --project-ref wkmhcvtpgscxzftyzmpd
npx supabase secrets set OPENAI_API_KEY=sk-xxx --project-ref wkmhcvtpgscxzftyzmpd
npx supabase secrets set VAPID_PUBLIC_KEY=BJlcrw2B... --project-ref wkmhcvtpgscxzftyzmpd
npx supabase secrets set VAPID_PRIVATE_KEY=ucjcxMic... --project-ref wkmhcvtpgscxzftyzmpd
npx supabase secrets set VAPID_EMAIL=mailto:hallo@supafix.de --project-ref wkmhcvtpgscxzftyzmpd
```

---

## 7. Supabase — DB Webhooks

Dashboard: https://supabase.com/dashboard/project/wkmhcvtpgscxzftyzmpd/database/hooks

| Name | Tabelle | Event | Edge Function |
|------|---------|-------|---------------|
| `offers_new_notify` | offers | INSERT | `send-notification` |
| `offers_accepted_notify` | offers | UPDATE | `send-notification` |
| `requests_auto_bid` | service_requests | INSERT | `auto-bid` |
| `requests_notify_providers` | service_requests | INSERT | `notify-providers` |

---

## 8. Admin-Account einrichten

In Supabase SQL Editor:
```sql
-- Ersetze mit deiner User-ID (nach Registrierung)
UPDATE profiles SET role = 'admin' WHERE email = 'hallo@hesselmann-service.de';
```

Admin Panel dann unter: https://supafix.de/admin

---

## 9. Smoke Test — Checkliste

- [ ] https://supafix.de lädt (Landing Page)
- [ ] https://supafix.de/preise (Pricing Page)
- [ ] https://supafix.de/handwerker/sanitaer (SEO-Seite)
- [ ] https://supafix.de/api/og (OG Image, 1200×630)
- [ ] https://supafix.de/sitemap.xml
- [ ] https://supafix.de/robots.txt
- [ ] Registrierung als Kunde
- [ ] Auftrag erstellen (Wizard, alle 5 Schritte)
- [ ] Registrierung als Dienstleister
- [ ] Provider Onboarding (Kategorien, PLZ, Profil)
- [ ] Angebot abgeben auf offenen Auftrag
- [ ] Angebot akzeptieren als Kunde
- [ ] Stripe Zahlung (Testmodus)
- [ ] Chat zwischen Kunde & Dienstleister
- [ ] Stripe Connect Flow (Provider)
- [ ] Push Notification bei neuem Auftrag
- [ ] Admin Panel: /admin (nach role=admin setzen)
- [ ] Bewertung nach Auftragsabschluss

---

## 10. Post-Launch

- [ ] Google Search Console → sitemap.xml einreichen
- [ ] Resend Domain-Warming (erste E-Mails manuell, dann automatisch)
- [ ] PostHog Dashboard einrichten (Funnels: Register → Auftrag → Zahlung)
- [ ] Sentry Alerts konfigurieren
- [ ] Supabase Backup-Schedule prüfen
- [ ] Vercel Analytics aktivieren
- [ ] Erste Dienstleister manuell einladen (Referral-Links)

---

*Stand: April 2026 — alle Code-Features deployed auf Vercel main branch.*
