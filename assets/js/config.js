/**
 * ICO App – Environment Configuration
 *
 * Phase 4: Set SUPABASE_URL and SUPABASE_ANON_KEY to enable cloud sync.
 * Never commit real credentials to source control; use environment variables
 * or a build-time injection step.
 */
(function (root) {
  'use strict';

  var ICO = root.ICO = root.ICO || {};

  /**
   * @namespace ICO.Config
   * Global application configuration. All other modules read from here.
   */
  ICO.Config = {
    /** Human-readable version string displayed on the Settings page. */
    APP_VERSION: '3.0.0',

    /** localStorage key prefix applied to every stored entry. */
    STORAGE_PREFIX: 'ico_',

    // ── Phase 4: Supabase credentials ────────────────────────────────────
    // Replace the empty strings below with your Supabase project values.
    // Example SUPABASE_URL : 'https://xyzabcdefg.supabase.co'
    // Example SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    // ─────────────────────────────────────────────────────────────────────

    /** Your Supabase project URL (Phase 4). */
    SUPABASE_URL: '',

    /** Public anon key from Supabase dashboard → Settings → API (Phase 4). */
    SUPABASE_ANON_KEY: ''
  };

})(window);
