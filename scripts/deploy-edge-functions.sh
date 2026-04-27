#!/usr/bin/env bash
# Deploy all Supabase Edge Functions
# Run once: supabase login (needs management API token from https://supabase.com/dashboard/account/tokens)

set -e

PROJECT_REF="wkmhcvtpgscxzftyzmpd"

echo "Linking project..."
npx supabase link --project-ref $PROJECT_REF

echo "Deploying auto-bid..."
npx supabase functions deploy auto-bid --project-ref $PROJECT_REF

echo "Deploying send-notification..."
npx supabase functions deploy send-notification --project-ref $PROJECT_REF

echo ""
echo "=== Required Secrets ==="
echo "Set via: npx supabase secrets set KEY=value --project-ref $PROJECT_REF"
echo ""
echo "  RESEND_API_KEY=re_xxxx              (from resend.com)"
echo "  APP_URL=https://supafix.de"
echo "  OPENAI_API_KEY=sk-xxx               (for auto-bid)"
echo "  STRIPE_SECRET_KEY=sk_live_xxx"
echo ""
echo "=== DB Webhooks to create in Supabase Dashboard ==="
echo "Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF/database/hooks"
echo ""
echo "  1. offers_new_offer_notify"
echo "     Table: offers | Event: INSERT"
echo "     → Edge Function: send-notification"
echo ""
echo "  2. offers_accepted_notify"
echo "     Table: offers | Event: UPDATE"
echo "     → Edge Function: send-notification"
echo ""
echo "  3. service_requests_auto_bid"
echo "     Table: service_requests | Event: INSERT"
echo "     → Edge Function: auto-bid"
