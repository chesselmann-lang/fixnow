-- ============================================================
-- Schema v5: Reviews + paid_at/completed_at refinements
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/wkmhcvtpgscxzftyzmpd/sql
-- ============================================================

-- 1. Reviews table (if not already exists from schema v2)
CREATE TABLE IF NOT EXISTS reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id     UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  reviewer_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (offer_id)  -- one review per offer
);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviewer can insert own review"
  ON reviews FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Reviewer can update own review"
  ON reviews FOR UPDATE
  USING (reviewer_id = auth.uid());

CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

-- 2. Add paid_at to offers (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offers' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE offers ADD COLUMN paid_at TIMESTAMPTZ;
  END IF;
END $$;

-- 3. Add completed_at to service_requests (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE service_requests ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
END $$;

-- 4. Add accepted_offer_id to service_requests (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'accepted_offer_id'
  ) THEN
    ALTER TABLE service_requests
      ADD COLUMN accepted_offer_id UUID REFERENCES offers(id);
  END IF;
END $$;

-- 5. Stripe fields on provider_profiles (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'provider_profiles' AND column_name = 'stripe_account_id'
  ) THEN
    ALTER TABLE provider_profiles
      ADD COLUMN stripe_account_id TEXT,
      ADD COLUMN stripe_verified   BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 6. Offer status check (extend if needed)
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;
ALTER TABLE offers ADD CONSTRAINT offers_status_check
  CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'completed', 'paid'));

-- 7. Index for earnings queries
CREATE INDEX IF NOT EXISTS idx_offers_provider_paid
  ON offers (provider_id, paid_at)
  WHERE paid_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee
  ON reviews (reviewee_id);

COMMENT ON TABLE reviews IS 'Customer reviews for completed service jobs';
