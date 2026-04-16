-- ============================================================================
-- KirchenKI v2 – Schema-Erweiterung
-- Migration: 20260416_add_social_media
-- ============================================================================

-- 1) Social-Media Waitlist für Landing Page Early Access
CREATE TABLE IF NOT EXISTS social_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  church_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_source TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'invited', 'active', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  invited_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_social_waitlist_email
  ON social_waitlist(LOWER(email));

ALTER TABLE social_waitlist ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_waitlist'
    AND policyname = 'Users can view own waitlist entries'
  ) THEN
    CREATE POLICY "Users can view own waitlist entries"
      ON social_waitlist FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2) Social Media Jobs
CREATE TABLE IF NOT EXISTS social_media_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sermon_id UUID REFERENCES sermons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'queued'
    CHECK (status IN ('queued', 'transcribing', 'analyzing', 'generating', 'done', 'failed')),
  total_clips INT DEFAULT 0,
  total_images INT DEFAULT 0,
  export_zip_path TEXT,
  error_message TEXT,
  user_rating INT CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_social_media_jobs_user_id ON social_media_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_jobs_status ON social_media_jobs(status);

ALTER TABLE social_media_jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_media_jobs'
    AND policyname = 'Users can view own social media jobs'
  ) THEN
    CREATE POLICY "Users can view own social media jobs"
      ON social_media_jobs FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_media_jobs'
    AND policyname = 'Users can insert own social media jobs'
  ) THEN
    CREATE POLICY "Users can insert own social media jobs"
      ON social_media_jobs FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_media_jobs'
    AND policyname = 'Users can update own social media jobs'
  ) THEN
    CREATE POLICY "Users can update own social media jobs"
      ON social_media_jobs FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3) Social Media Assets
CREATE TABLE IF NOT EXISTS social_media_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES social_media_jobs(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT NOT NULL
    CHECK (asset_type IN ('clip', 'quote_image', 'caption')),
  storage_path TEXT,
  caption_variants JSONB,
  highlight_timestamp_start INT,
  highlight_timestamp_end INT,
  highlight_reason TEXT,
  user_approved BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_media_assets_job_id ON social_media_assets(job_id);

ALTER TABLE social_media_assets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_media_assets'
    AND policyname = 'Users can view own assets'
  ) THEN
    CREATE POLICY "Users can view own assets"
      ON social_media_assets FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM social_media_jobs
        WHERE social_media_jobs.id = social_media_assets.job_id
        AND social_media_jobs.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_media_assets'
    AND policyname = 'Users can update own assets'
  ) THEN
    CREATE POLICY "Users can update own assets"
      ON social_media_assets FOR UPDATE
      USING (EXISTS (
        SELECT 1 FROM social_media_jobs
        WHERE social_media_jobs.id = social_media_assets.job_id
        AND social_media_jobs.user_id = auth.uid()
      ));
  END IF;
END $$;

-- 4) User-Quota erweitern
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS sermon_credits_included INT DEFAULT 4,
  ADD COLUMN IF NOT EXISTS sermon_credits_used INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sermon_credits_overage INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billing_cycle_start DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS social_media_enabled BOOLEAN DEFAULT FALSE;

-- 5) Update-Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_user_settings_updated_at
      BEFORE UPDATE ON user_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- MANUELL im Supabase Dashboard anlegen (NICHT via SQL):
-- Storage Bucket 'social-exports' (privat, 500 MB Limit, MIME: video/mp4, image/*, application/zip)
-- ============================================================================
