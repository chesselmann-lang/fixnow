-- supafix Schema v4: Stripe Connect + Payment Escrow
-- Run in Supabase SQL Editor

-- Add stripe columns to provider_profiles
ALTER TABLE provider_profiles
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_verified boolean DEFAULT false;

-- Add payment tracking to offers
ALTER TABLE offers
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'paid', 'completed', 'cancelled')),
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Add accepted_offer_id to service_requests
ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS accepted_offer_id uuid REFERENCES offers(id);

-- Policy: providers can see their own stripe_account_id
CREATE POLICY IF NOT EXISTS "providers_own_stripe" ON provider_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Index for stripe account lookup
CREATE INDEX IF NOT EXISTS idx_provider_stripe ON provider_profiles(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
