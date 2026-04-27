-- ============================================================
-- Schema v6: Referral System
-- ============================================================

CREATE TABLE IF NOT EXISTS referral_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code        TEXT NOT NULL UNIQUE,
  uses        INT  DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_uses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id         UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rewarded        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (referred_user_id)  -- one referral per user
);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_uses  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads own referral codes"
  ON referral_codes FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Anyone can read referral code by code (for join page)"
  ON referral_codes FOR SELECT USING (true);

CREATE POLICY "Insert own referral code"
  ON referral_codes FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner reads own uses"
  ON referral_uses FOR SELECT USING (
    code_id IN (SELECT id FROM referral_codes WHERE owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_uses_code ON referral_uses(code_id);

-- Add referred_by to profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referred_by_code') THEN
    ALTER TABLE profiles ADD COLUMN referred_by_code TEXT;
  END IF;
END $$;

COMMENT ON TABLE referral_codes IS 'Provider/user referral codes for invite tracking';
COMMENT ON TABLE referral_uses  IS 'Tracks which users registered via a referral code';

-- ============================================================
-- Trigger: on new profile insert, record referral use if ref code present
-- ============================================================
CREATE OR REPLACE FUNCTION handle_referral_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_code_id UUID;
BEGIN
  IF NEW.referred_by_code IS NOT NULL AND NEW.referred_by_code != '' THEN
    SELECT id INTO v_code_id
      FROM referral_codes
      WHERE code = NEW.referred_by_code
      LIMIT 1;

    IF v_code_id IS NOT NULL THEN
      -- Record use (ignore conflicts — user can only be referred once)
      INSERT INTO referral_uses (code_id, referred_user_id)
        VALUES (v_code_id, NEW.id)
        ON CONFLICT (referred_user_id) DO NOTHING;

      -- Increment counter
      UPDATE referral_codes SET uses = uses + 1 WHERE id = v_code_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_referral ON profiles;
CREATE TRIGGER on_profile_referral
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_referral_on_signup();

-- ============================================================
-- Update handle_new_user trigger to copy referred_by_code from auth metadata
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, referred_by_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unbekannt'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'),
    NEW.raw_user_meta_data->>'referred_by_code'
  )
  ON CONFLICT (id) DO UPDATE
    SET referred_by_code = EXCLUDED.referred_by_code;
  RETURN NEW;
END;
$$;

-- ============================================================
-- Push Subscriptions (für Web Push Notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL UNIQUE,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User manages own subscriptions"
  ON push_subscriptions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
