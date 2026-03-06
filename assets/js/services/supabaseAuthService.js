/**
 * ICO App – Supabase Auth Service
 *
 * Overrides ICO.AuthService with a Supabase-backed implementation when
 * ICO.SupabaseClient is available.  Falls back to the local implementation
 * loaded earlier if no Supabase client exists.
 *
 * Table: profiles
 *   id         uuid primary key default gen_random_uuid()
 *   name       text not null
 *   initials   text
 *   role       text
 *   email      text
 *   created_at timestamptz default now()
 *   updated_at timestamptz default now()
 *
 * The in-memory cache is populated asynchronously on load.  All synchronous
 * read calls (getAll / getById) use the cache; mutations update the cache and
 * flush to Supabase async so the UI remains responsive.
 *
 * Supabase Auth note:
 *   When Supabase Auth (email / password) is required, extend the create()
 *   method to call supabase.auth.signUp({ email, password }) before inserting
 *   the profile row.  Set the profiles.id equal to the auth UID returned so
 *   that Row-Level Security policies work correctly.  See README for details.
 *
 * @namespace ICO.AuthService  (replaced when Supabase configured)
 */
(function (root) {
  'use strict';

  var ICO = root.ICO = root.ICO || {};

  // Only override when a Supabase client is present.
  if (!ICO.SupabaseClient) { return; }

  var sb = ICO.SupabaseClient;
  var TABLE = 'profiles';

  /** In-memory cache of all profiles. */
  var _cache = [];
  var _ready = false;

  /** Fetch all profiles from Supabase into the local cache. */
  function _load() {
    sb.from(TABLE)
      .select('*')
      .order('created_at', { ascending: true })
      .then(function (res) {
        if (res.error) {
          console.error('[ICO:AuthService] Load error:', res.error.message);
        } else {
          _cache = (res.data || []).map(_fromRow);
          _ready = true;
          console.info('[ICO:AuthService] Loaded ' + _cache.length + ' profiles from Supabase.');
        }
      });
  }

  /** Map a DB row to the internal Profile shape. */
  function _fromRow(row) {
    return {
      id:        row.id,
      name:      row.name,
      initials:  row.initials || ICO.fmt.initials(row.name),
      role:      row.role     || 'User',
      email:     row.email    || '',
      createdAt: row.created_at
    };
  }

  /** Map an internal Profile to a DB row for INSERT. */
  function _toRow(profile) {
    return {
      id:        profile.id,
      name:      profile.name,
      initials:  profile.initials || ICO.fmt.initials(profile.name),
      role:      profile.role     || 'User',
      email:     profile.email    || '',
      created_at: profile.createdAt,
      updated_at: ICO.nowISO()
    };
  }

  ICO.AuthService = {
    /**
     * Return all profiles (from cache).
     * @returns {Profile[]}
     */
    getAll: function () {
      return _cache;
    },

    /**
     * Find a single profile by its ID.
     * @param  {string} id
     * @returns {Profile|undefined}
     */
    getById: function (id) {
      return _cache.find(function (p) { return p.id === id; });
    },

    /**
     * Create and persist a new profile.
     * @param  {{ name: string, initials?: string, role?: string, email?: string }} data
     * @returns {Profile}
     */
    create: function (data) {
      var profile = Object.assign(
        { id: 'profile_' + ICO.uid(), createdAt: ICO.nowISO() },
        data
      );
      if (!profile.initials) {
        profile.initials = ICO.fmt.initials(profile.name);
      }

      _cache.push(profile);

      sb.from(TABLE).insert(_toRow(profile)).then(function (res) {
        if (res.error) {
          console.error('[ICO:AuthService] Insert error:', res.error.message);
        } else {
          console.info('[ICO:AuthService] Profile "' + profile.name + '" saved to Supabase.');
        }
      });

      ICO.AuditService.log('create', 'Profile', profile.id, profile.name, 'Profile created');
      return profile;
    },

    /**
     * Record a login event in the audit log.
     * @param {Profile} profile
     */
    login: function (profile) {
      ICO.AuditService.log('login', 'Profile', profile.id, profile.name, 'Signed in', profile.id);
    },

    /**
     * Record a logout event in the audit log.
     * @param {Profile} profile
     */
    logout: function (profile) {
      ICO.AuditService.log('logout', 'Profile', profile.id, profile.name, 'Signed out', profile.id);
    },

    // ── Internal helpers ────────────────────────────────────────────────

    /**
     * Overwrite the cache and sync to Supabase (used by ReportService.importAll).
     * Upserts all records so existing rows are not duplicated.
     */
    _import: function (list) {
      _cache = list;
      if (!list || !list.length) { return; }
      var rows = list.map(_toRow);
      sb.from(TABLE).upsert(rows).then(function (res) {
        if (res.error) {
          console.error('[ICO:AuthService] Import upsert error:', res.error.message);
        }
      });
    },

    /**
     * Clear all profiles in Supabase and reset the cache
     * (used by ReportService.resetAll).
     */
    _reset: function () {
      _cache = [];
      sb.from(TABLE).delete().neq('id', '').then(function (res) {
        if (res.error) {
          console.error('[ICO:AuthService] Reset delete error:', res.error.message);
        }
      });
    }
  };

  // Kick off the initial data load.
  _load();

})(window);
