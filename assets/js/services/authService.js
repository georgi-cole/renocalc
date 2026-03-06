/**
 * ICO App – Auth Service
 *
 * Manages user profiles and application session events (login / logout).
 * In Phase 4 this module will delegate to Supabase Auth (email/password or
 * magic link) for credential verification, and to a `profiles` table for
 * storing display names, roles, and avatar initials.
 *
 * Phase 4 migration guide:
 *   • getAll()   → SELECT * FROM profiles (with RLS scoped to the project)
 *   • getById()  → SELECT * FROM profiles WHERE id = :id
 *   • create()   → INSERT INTO profiles + supabase.auth.signUp()
 *   • login()    → supabase.auth.signInWithPassword() / signInWithOtp()
 *   • logout()   → supabase.auth.signOut()
 *
 * @namespace ICO.AuthService
 *
 * Interface:
 *   getAll()       → Profile[]
 *   getById(id)    → Profile | undefined
 *   create(data)   → Profile
 *   login(profile) → void   (records an audit event)
 *   logout(profile)→ void   (records an audit event)
 *
 * Profile entity shape:
 *   id         string   'profile_<uid>'
 *   name       string
 *   initials   string   Up to 2 uppercase characters
 *   role       string
 *   createdAt  string   ISO 8601
 */
(function (root) {
  'use strict';

  var ICO = root.ICO = root.ICO || {};

  /** Seed profiles used when no persisted data exists. */
  var SEED_PROFILES = [
    { id: 'profile_1', name: 'Alex Renovator', initials: 'AR', role: 'Project Manager',  createdAt: '2025-01-10T09:00:00.000Z' },
    { id: 'profile_2', name: 'Jordan Builder',  initials: 'JB', role: 'Site Coordinator', createdAt: '2025-01-10T09:05:00.000Z' }
  ];

  ICO.AuthService = {
    /**
     * Return all profiles.
     * Falls back to seed data when no profiles have been persisted yet.
     * @returns {Profile[]}
     */
    getAll: function () {
      return ICO.StorageService.get('profiles') || JSON.parse(JSON.stringify(SEED_PROFILES));
    },

    /**
     * Find a single profile by its ID.
     * @param  {string} id
     * @returns {Profile|undefined}
     */
    getById: function (id) {
      return ICO.AuthService.getAll().find(function (p) { return p.id === id; });
    },

    /**
     * Create and persist a new profile.
     * @param  {{ name: string, initials?: string, role?: string }} data
     * @returns {Profile}
     */
    create: function (data) {
      var list = ICO.AuthService.getAll();
      var profile = Object.assign({ id: 'profile_' + ICO.uid(), createdAt: ICO.nowISO() }, data);
      list.push(profile);
      ICO.StorageService.set('profiles', list);
      ICO.AuditService.log('create', 'Profile', profile.id, profile.name, 'Profile created');
      return profile;
    },

    /**
     * Record a login event in the audit log.
     * Phase 4: call supabase.auth.signIn*() before invoking this method.
     * @param {Profile} profile
     */
    login: function (profile) {
      ICO.AuditService.log('login', 'Profile', profile.id, profile.name, 'Signed in', profile.id);
    },

    /**
     * Record a logout event in the audit log.
     * Phase 4: call supabase.auth.signOut() after invoking this method.
     * @param {Profile} profile
     */
    logout: function (profile) {
      ICO.AuditService.log('logout', 'Profile', profile.id, profile.name, 'Signed out', profile.id);
    },

    // ── Internal helpers (used by ReportService for import/reset) ──────

    /** Overwrite the profiles list (called by ReportService.importAll). */
    _import: function (list) {
      ICO.StorageService.set('profiles', list);
    },

    /** Restore profiles to seed data (called by ReportService.resetAll). */
    _reset: function () {
      ICO.StorageService.set('profiles', JSON.parse(JSON.stringify(SEED_PROFILES)));
    }
  };

})(window);
