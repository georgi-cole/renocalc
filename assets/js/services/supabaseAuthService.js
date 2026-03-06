/**
 * ICO App – Supabase Auth Service
 *
 * When ICO.SupabaseClient is available this module:
 *  1. Overrides ICO.AuthService with a Supabase-backed profile CRUD service
 *     (same interface as the local service loaded earlier).
 *  2. Adds ICO.SupabaseAuth – a real Supabase email/password auth object that
 *     manages sessions, links profiles to auth users, and guards app boot.
 *
 * Table: profiles
 *   id            text  primary key  (set to auth.uid()::text for cloud users)
 *   name          text  not null
 *   display_name  text              (alias populated from auth metadata)
 *   initials      text
 *   role          text
 *   email         text
 *   auth_user_id  uuid  references auth.users(id)
 *   created_at    timestamptz
 *   updated_at    timestamptz
 *
 * Session / profile lifecycle:
 *   sign-up  → auth.signUp → ensureProfile(user, displayName) → profile row
 *   sign-in  → auth.signInWithPassword → ensureProfile(user) → profile row
 *   refresh  → auth.getSession → ensureProfile(user) → profile row
 *   sign-out → auth.signOut → clear state → show auth screen
 *
 * @namespace ICO.AuthService    (replaced when Supabase configured)
 * @namespace ICO.SupabaseAuth   (added when Supabase configured)
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

  /** The profile linked to the current auth session, or null. */
  var _currentProfile = null;

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
          console.info('[ICO:AuthService] Loaded ' + _cache.length + ' profiles from Supabase.');
        }
      });
  }

  /** Map a DB row to the internal Profile shape. */
  function _fromRow(row) {
    var name = row.display_name || row.name;
    return {
      id:          row.id,
      name:        name,
      initials:    row.initials || ICO.fmt.initials(name),
      role:        row.role        || 'User',
      email:       row.email       || '',
      authUserId:  row.auth_user_id || null,
      createdAt:   row.created_at
    };
  }

  /** Map an internal Profile to a DB row for INSERT / UPSERT. */
  function _toRow(profile) {
    return {
      id:           profile.id,
      name:         profile.name,
      display_name: profile.name,
      initials:     profile.initials || ICO.fmt.initials(profile.name),
      role:         profile.role        || 'User',
      email:        profile.email       || '',
      auth_user_id: profile.authUserId  || null,
      created_at:   profile.createdAt,
      updated_at:   ICO.nowISO()
    };
  }

  // ── ICO.AuthService – profile CRUD (same interface as local service) ────────

  ICO.AuthService = {
    /** Return all profiles (from cache). */
    getAll: function () {
      return _cache;
    },

    /** Find a single profile by its ID. */
    getById: function (id) {
      return _cache.find(function (p) { return p.id === id; });
    },

    /**
     * Create and persist a new profile.
     * When data.authUserId is provided the profile id is set to that value so
     * that the Supabase RLS policy `id = auth.uid()::text` is satisfied.
     */
    create: function (data) {
      var profile = Object.assign(
        { id: data.authUserId || ('profile_' + ICO.uid()), createdAt: ICO.nowISO() },
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

    /** Record a login event in the audit log. */
    login: function (profile) {
      ICO.AuditService.log('login', 'Profile', profile.id, profile.name, 'Signed in', profile.id);
    },

    /** Record a logout event in the audit log. */
    logout: function (profile) {
      ICO.AuditService.log('logout', 'Profile', profile.id, profile.name, 'Signed out', profile.id);
    },

    // ── Internal helpers ────────────────────────────────────────────────────

    /** Overwrite the cache and sync to Supabase (used by ReportService.importAll). */
    _import: function (list) {
      _cache = list || [];
      if (!_cache.length) { return; }
      var rows = _cache.map(_toRow);
      sb.from(TABLE).upsert(rows).then(function (res) {
        if (res.error) {
          console.error('[ICO:AuthService] Import upsert error:', res.error.message);
        }
      });
    },

    /** Clear all profiles and re-seed (used by ReportService.resetAll). */
    _reset: function () {
      var seeds = ICO.SEED_PROFILES || [];

      _cache = [];

      sb.from(TABLE).delete().neq('id', '').then(function (res) {
        if (res.error) {
          console.error('[ICO:AuthService] Reset delete error:', res.error.message);
          return;
        }

        if (!seeds.length) { return; }

        _cache = seeds.map(function (p) { return Object.assign({}, p); });

        var rows = _cache.map(_toRow);
        sb.from(TABLE).upsert(rows).then(function (upsertRes) {
          if (upsertRes.error) {
            console.error('[ICO:AuthService] Reset seed upsert error:', upsertRes.error.message);
          }
        });
      });
    }
  };


  // ── ICO.SupabaseAuth – real Supabase Auth session management ────────────────

  ICO.SupabaseAuth = {

    /**
     * Sign up with email and password.
     * Creates an auth user and a linked profile row.
     *
     * @param  {string} email
     * @param  {string} password
     * @param  {string} displayName  Friendly display name for the new profile.
     * @returns {Promise<{ profile: Profile|null, error: Error|null, confirmEmail?: boolean }>}
     */
    signUp: function (email, password, displayName) {
      return sb.auth.signUp({ email: email, password: password })
        .then(function (res) {
          if (res.error) { return { profile: null, error: res.error }; }

          var user    = res.data && res.data.user;
          var session = res.data && res.data.session;

          if (!user) { return { profile: null, error: new Error('No user returned from sign-up') }; }

          // Email confirmation required – session is null until user confirms.
          if (!session) {
            return { profile: null, error: null, confirmEmail: true };
          }

          // Auto-confirmed (e.g. email confirm disabled in Supabase project).
          return ICO.SupabaseAuth.ensureProfile(user, displayName)
            .then(function (profile) {
              _currentProfile = profile;
              return { profile: profile, error: null };
            })
            .catch(function (err) {
              return { profile: null, error: err || new Error('Failed to create profile') };
            });
        });
    },

    /**
     * Sign in with email and password.
     * Finds the linked profile (or creates one on first sign-in).
     *
     * @param  {string} email
     * @param  {string} password
     * @returns {Promise<{ profile: Profile|null, error: Error|null }>}
     */
    signIn: function (email, password) {
      return sb.auth.signInWithPassword({ email: email, password: password })
        .then(function (res) {
          if (res.error) { return { profile: null, error: res.error }; }

          var user = res.data && res.data.user;
          if (!user) { return { profile: null, error: new Error('No user returned from sign-in') }; }

          return ICO.SupabaseAuth.ensureProfile(user)
            .then(function (profile) {
              _currentProfile = profile;
              return { profile: profile, error: null };
            })
            .catch(function (err) {
              return { profile: null, error: err || new Error('Failed to load profile') };
            });
        });
    },

    /**
     * Sign out the current user and clear cached identity.
     * @returns {Promise<{ error: Error|null }>}
     */
    signOut: function () {
      _currentProfile = null;
      return sb.auth.signOut().then(function (res) {
        return { error: res.error || null };
      });
    },

    /**
     * Return the current Supabase session, or null if none exists.
     * @returns {Promise<Session|null>}
     */
    getSession: function () {
      return sb.auth.getSession().then(function (res) {
        return (res.data && res.data.session) || null;
      });
    },

    /**
     * Register a callback for auth state changes (SIGNED_IN, SIGNED_OUT,
     * TOKEN_REFRESHED, etc.).  Call .data.subscription.unsubscribe() to remove.
     *
     * @param  {function} callback  (event: string, session: Session|null) => void
     * @returns Supabase subscription object
     */
    onAuthStateChange: function (callback) {
      return sb.auth.onAuthStateChange(callback);
    },

    /**
     * Return the cached profile for the currently authenticated user.
     * May be null before the first session check completes.
     * @returns {Profile|null}
     */
    getCurrentProfile: function () {
      return _currentProfile;
    },

    /**
     * Find or create a profile row for the given Supabase auth user.
     *
     * Lookup order:
     *   1. In-memory cache (auth_user_id match or id match).
     *   2. Supabase DB query (auth_user_id OR id = auth UID).
     *   3. Create a new profile row using the auth UID as the profile id so
     *      that the RLS policy `id = auth.uid()::text` is satisfied.
     *
     * @param  {object} user         Supabase Auth user object.
     * @param  {string} [displayName] Optional override used on initial sign-up.
     * @returns {Promise<Profile>}
     */
    ensureProfile: function (user, displayName) {
      // 1. Check in-memory cache first for a fast path.
      var cached = _cache.find(function (p) {
        return p.authUserId === user.id || p.id === user.id;
      });
      if (cached) {
        _currentProfile = cached;
        return Promise.resolve(cached);
      }

      // 2. Query Supabase for an existing profile linked to this auth user.
      return sb.from(TABLE)
        .select('*')
        .or('auth_user_id.eq.' + user.id + ',id.eq.' + user.id)
        .limit(1)
        .then(function (res) {
          if (res.error) {
            throw new Error('[ICO:SupabaseAuth] Profile lookup failed: ' + res.error.message);
          }

          if (res.data && res.data.length > 0) {
            var profile = _fromRow(res.data[0]);
            // Sync into cache.
            var idx = _cache.findIndex(function (p) { return p.id === profile.id; });
            if (idx !== -1) { _cache[idx] = profile; } else { _cache.push(profile); }
            _currentProfile = profile;
            return profile;
          }

          // 3. No profile found – create a minimal one linked to this auth user.
          var name = displayName
            || (user.user_metadata && user.user_metadata.full_name)
            || user.email.split('@')[0];

          var newProfile = {
            id:          user.id,         // profile.id = auth.uid() for RLS
            name:        name,
            initials:    ICO.fmt.initials(name),
            role:        'User',
            email:       user.email || '',
            authUserId:  user.id,
            createdAt:   ICO.nowISO()
          };

          return sb.from(TABLE).insert(_toRow(newProfile)).then(function (insertRes) {
            if (insertRes.error) {
              // A unique-constraint violation usually means a concurrent request
              // already created the row.  Re-query so we get the actual DB row
              // rather than caching a profile that may not exist.
              var isUniqueViolation = insertRes.error.code === '23505';
              if (isUniqueViolation) {
                return sb.from(TABLE)
                  .select('*')
                  .or('auth_user_id.eq.' + user.id + ',id.eq.' + user.id)
                  .limit(1)
                  .then(function (retryRes) {
                    if (retryRes.error || !retryRes.data || !retryRes.data.length) {
                      throw new Error('[ICO:SupabaseAuth] Could not fetch profile after duplicate insert: ' +
                        (retryRes.error ? retryRes.error.message : 'no rows'));
                    }
                    var profile = _fromRow(retryRes.data[0]);
                    var idx = _cache.findIndex(function (p) { return p.id === profile.id; });
                    if (idx !== -1) { _cache[idx] = profile; } else { _cache.push(profile); }
                    _currentProfile = profile;
                    return profile;
                  });
              }
              // Non-recoverable insert error – throw so callers can show an auth error.
              throw new Error('[ICO:SupabaseAuth] Profile insert failed: ' + insertRes.error.message);
            }
            _cache.push(newProfile);
            _currentProfile = newProfile;
            return newProfile;
          });
        });
    },

    /**
     * Handle an active session on boot (session restore / token refresh).
     * Calls ensureProfile so the cached profile is ready before showing the app.
     *
     * @param  {Session} session  Active Supabase session.
     * @returns {Promise<Profile>}
     */
    handleSession: function (session) {
      return ICO.SupabaseAuth.ensureProfile(session.user);
    }
  };

  // Kick off the initial profile cache load.
  _load();

})(window);

