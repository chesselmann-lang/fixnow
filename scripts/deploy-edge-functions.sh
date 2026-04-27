#!/bin/bash
# supafix — Edge Function Deployment
# Run ONCE after: npx supabase login
set -e

PROJECT_REF="wkmhcvtpgscxzftyzmpd"
echo "🚀 Deploying auto-bid Edge Function to project $PROJECT_REF..."

npx supabase link --project-ref $PROJECT_REF
npx supabase functions deploy auto-bid --project-ref $PROJECT_REF --no-verify-jwt

echo ""
echo "✅ auto-bid deployed!"
echo ""
echo "Set these secrets in Supabase Dashboard → Edge Functions → auto-bid → Secrets:"
echo "  HESSELMANN_PROVIDER_ID = <uuid aus provider_profiles Tabelle>"
echo "  SUPABASE_SERVICE_ROLE_KEY = <aus Supabase Settings → API>"
echo ""
echo "Dann Webhook anlegen: Database → Webhooks → New webhook"
echo "  Table: service_requests | Event: INSERT"
echo "  URL: https://$PROJECT_REF.supabase.co/functions/v1/auto-bid"
