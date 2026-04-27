# supafix — Manual Migration Steps

## Schema v4 (Stripe Connect)
Run `supabase/schema_v4_stripe.sql` in Supabase Dashboard → SQL Editor

This adds:
- `provider_profiles.stripe_account_id` (text)
- `provider_profiles.stripe_verified` (boolean)
- `offers.status` CHECK constraint (pending/accepted/paid/completed/cancelled)
- `offers.paid_at` (timestamptz)
- `service_requests.accepted_offer_id` (uuid FK to offers)

## Edge Function
See `scripts/deploy-edge-functions.sh`

## DNS (Mittwald mStudio)
In mStudio → supafix.de Projekt → Domains → DNS:
- A-Record:    supafix.de     → 76.76.21.21
- CNAME:       www.supafix.de → cname.vercel-dns.com

## Vercel Env Vars (replace PLACEHOLDERs)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → from Stripe Dashboard
- NEXT_PUBLIC_POSTHOG_KEY → from PostHog (eu.posthog.com)
- NEXT_PUBLIC_SENTRY_DSN → from Sentry (sentry.io)
- TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_VERIFY_SERVICE_SID → from Twilio

## Schema v5 — Reviews + paid_at + completed_at

File: `supabase/schema_v5_reviews.sql`

Run in Supabase SQL Editor:
https://supabase.com/dashboard/project/wkmhcvtpgscxzftyzmpd/sql/new

Adds:
- `reviews` table with RLS (one review per offer, rating 1–5)
- `offers.paid_at` TIMESTAMPTZ
- `service_requests.completed_at` + `accepted_offer_id`
- `provider_profiles.stripe_account_id` + `stripe_verified`
- Offer status extended to include 'completed', 'paid'
- Indexes for earnings queries

### Resend Setup (for email notifications)

1. Create free account at resend.com
2. Add & verify domain `supafix.de`
3. Create API key → set as Vercel env + Supabase secret:
   ```
   RESEND_API_KEY=re_xxxx
   ```
4. Deploy Edge Function: `./scripts/deploy-edge-functions.sh`
5. Create DB webhooks in Supabase Dashboard (see script output)
