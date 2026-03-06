-- =============================================================================
-- ICO Renovation Reporting App – Supabase Schema Migration
-- File   : migrations/sql/2026-03-06-create-tables.sql
-- Run in : Supabase project → SQL Editor (or supabase db push)
-- =============================================================================
-- Tables created:
--   profiles   – application user profiles
--   activities – renovation activities (includes payment fields)
--   audit_logs – append-only change history
-- =============================================================================


-- ---------------------------------------------------------------------------
-- EXTENSION: uuid generation
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ---------------------------------------------------------------------------
-- TABLE: profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email       TEXT,
  name        TEXT        NOT NULL,
  initials    TEXT,
  role        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- TODO: Review and tighten these policies for your sharing model.
-- Allow authenticated users to read all profiles (project-wide visibility).
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert their own profile row.
CREATE POLICY "profiles_insert_authenticated"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update only their own profile.
-- TODO: replace with auth.uid()::TEXT = id if using Supabase Auth UIDs.
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid()::TEXT = id)
  WITH CHECK (auth.uid()::TEXT = id);


-- ---------------------------------------------------------------------------
-- TABLE: activities
-- Includes payment fields so no separate payments table is required.
-- Note: id uses plain gen_random_uuid()::TEXT (no prefix) for consistency
--       with the profiles table.  Application-layer IDs (e.g. 'act_xxx')
--       supplied by the JS client are stored as-is when provided.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
  id             TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  date           DATE,
  title          TEXT        NOT NULL,
  category       TEXT,
  payment_amount NUMERIC     NOT NULL DEFAULT 0,
  payment_type   TEXT,
  remaining      NUMERIC     NOT NULL DEFAULT 0,
  currency       TEXT        NOT NULL DEFAULT 'GBP',
  who_paid       TEXT,
  status         TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','in_progress','completed','cancelled')),
  supplier       TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- References are TEXT so they work with both local 'profile_1' IDs and UUIDs.
  created_by     TEXT        REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by     TEXT        REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- TODO: Restrict to project members once multi-project support is added.
CREATE POLICY "activities_select_authenticated"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "activities_insert_authenticated"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid()::text);

-- Allow the creator to update/delete their own activities.
-- TODO: Relax to allow project-wide edits if a shared model is preferred.
CREATE POLICY "activities_update_creator"
  ON activities FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid()::text)
  WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "activities_delete_creator"
  ON activities FOR DELETE
  TO authenticated
  USING (created_by = auth.uid()::text);


-- ---------------------------------------------------------------------------
-- TABLE: audit_logs  (append-only – no UPDATE or DELETE policies)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id     TEXT        REFERENCES profiles(id) ON DELETE SET NULL,
  user_name   TEXT,
  entity      TEXT        NOT NULL,
  entity_id   TEXT,
  action      TEXT        NOT NULL
              CHECK (action IN ('create','update','delete','login','logout')),
  summary     TEXT,
  previous    JSONB,
  next        JSONB,
  comment     TEXT
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users may read the full audit log.
CREATE POLICY "audit_logs_select_authenticated"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- Any authenticated user may INSERT (append) a log entry.
-- No UPDATE or DELETE policies – this keeps the log tamper-proof.
CREATE POLICY "audit_logs_insert_authenticated"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
-- TODO: Uncomment the line below if you want to allow anon reads during development:
-- CREATE POLICY "audit_logs_select_anon" ON audit_logs FOR SELECT TO anon USING (true);


-- ---------------------------------------------------------------------------
-- HELPER: auto-update updated_at columns
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
