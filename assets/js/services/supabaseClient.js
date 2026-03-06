/**
 * ICO App – Supabase Client Initialiser
 *
 * Creates and exposes ICO.SupabaseClient when both SUPABASE_URL and
 * SUPABASE_ANON_KEY are configured in ICO.Config.  If either value is
 * absent the property is set to null and all Supabase service modules fall
 * back gracefully to the local-storage implementations.
 *
 * Load order: after config.js and before any supabase*Service.js files.
 *
 * Setup:
 *   1. Create a Supabase project at https://supabase.com
 *   2. Run migrations/sql/2026-03-06-create-tables.sql in the SQL editor.
 *   3. Copy your project URL and anon key into assets/js/config.js
 *      (SUPABASE_URL and SUPABASE_ANON_KEY fields) – do NOT commit that file
 *      with real credentials; add it to .gitignore or use a local override.
 *
 * @namespace ICO.SupabaseClient
 */
(function (root) {
  'use strict';

  var ICO = root.ICO = root.ICO || {};
  var cfg = ICO.Config || {};

  if (
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    root.supabase &&
    typeof root.supabase.createClient === 'function'
  ) {
    ICO.SupabaseClient = root.supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_ANON_KEY
    );
    console.info('[ICO] Supabase client initialised – cloud persistence active.');
  } else {
    ICO.SupabaseClient = null;
    console.info('[ICO] Supabase config not set – using local-storage fallback.');
  }

})(window);
