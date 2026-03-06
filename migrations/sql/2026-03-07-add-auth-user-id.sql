-- =============================================================================
-- ICO Renovation Reporting App – Auth Profile Linkage Migration
-- File   : migrations/sql/2026-03-07-add-auth-user-id.sql
-- Run in : Supabase project → SQL Editor
-- Run AFTER: 2026-03-06-create-tables.sql
-- =============================================================================
-- Adds Supabase Auth linkage columns to the profiles table and tightens
-- Row Level Security policies so that every write is scoped to the
-- authenticated user.  Also updates activities RLS to use project-wide
-- authenticated access while still requiring a valid session.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- PROFILES: link each row to a Supabase Auth user
-- ---------------------------------------------------------------------------

-- auth_user_id references the Supabase auth.users table so each profile row
-- can be unambiguously tied to an authenticated identity.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS auth_user_id UUID
    UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- display_name mirrors the name column; populated from auth user metadata on
-- first sign-in so the UI always has a friendly label ready.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Back-fill display_name for any existing rows.
UPDATE profiles SET display_name = name WHERE display_name IS NULL;


-- ---------------------------------------------------------------------------
-- PROFILES – updated RLS policies
-- ---------------------------------------------------------------------------

-- Allow any authenticated user to read all profiles (needed for audit log
-- user-name lookups across the project).
DROP POLICY IF EXISTS "profiles_select_authenticated" ON profiles;
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users may only insert their own profile row.
-- New cloud-mode profiles set id = auth.uid()::TEXT for seamless RLS; legacy
-- rows may use auth_user_id as the ownership signal instead.
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth_user_id = auth.uid()
    OR id = auth.uid()::TEXT
  );

-- Users may only update their own profile row.
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR id = auth.uid()::TEXT
  )
  WITH CHECK (
    auth_user_id = auth.uid()
    OR id = auth.uid()::TEXT
  );


-- ---------------------------------------------------------------------------
-- ACTIVITIES – tighten insert/update/delete to authenticated users only
-- (existing policies already use auth.uid(); no functional change here,
--  but drop-and-recreate ensures the policy text is canonical)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "activities_select_authenticated" ON activities;
CREATE POLICY "activities_select_authenticated"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

-- Any authenticated user may insert; created_by must equal their auth UID so
-- that ownership is clear (profile.id = auth.uid() for cloud-mode profiles).
DROP POLICY IF EXISTS "activities_insert_authenticated" ON activities;
CREATE POLICY "activities_insert_authenticated"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid()::TEXT);

-- Only the creator may update their own activities.
DROP POLICY IF EXISTS "activities_update_creator" ON activities;
CREATE POLICY "activities_update_creator"
  ON activities FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid()::TEXT)
  WITH CHECK (created_by = auth.uid()::TEXT);

-- Only the creator may delete their own activities.
DROP POLICY IF EXISTS "activities_delete_creator" ON activities;
CREATE POLICY "activities_delete_creator"
  ON activities FOR DELETE
  TO authenticated
  USING (created_by = auth.uid()::TEXT);


-- ---------------------------------------------------------------------------
-- AUDIT LOGS – no structural changes; append-only model remains correct.
-- Ensure anon users cannot read or write the audit log.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "audit_logs_select_authenticated" ON audit_logs;
CREATE POLICY "audit_logs_select_authenticated"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "audit_logs_insert_authenticated" ON audit_logs;
CREATE POLICY "audit_logs_insert_authenticated"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::TEXT);
