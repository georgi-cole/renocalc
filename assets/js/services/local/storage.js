/**
 * ICO App – Storage Service
 *
 * Provides a thin key/value persistence abstraction over localStorage.
 * All other service modules call only this interface; they never touch
 * localStorage directly.  This makes it straightforward to swap the
 * backing store for Supabase in Phase 4.
 *
 * Phase 4 migration guide:
 *   Replace each method body with the equivalent Supabase table operation.
 *   Because Supabase calls are asynchronous you will also need to update
 *   the calling services to return Promises (or use async/await).
 *
 * @namespace ICO.StorageService
 *
 * Interface:
 *   get(key)        → any | null
 *   set(key, value) → void
 *   remove(key)     → void
 */
(function (root) {
  'use strict';

  var ICO    = root.ICO = root.ICO || {};
  var prefix = (ICO.Config || {}).STORAGE_PREFIX || 'ico_';

  ICO.StorageService = {
    /**
     * Retrieve a stored value.
     * @param  {string} key
     * @returns {*} Parsed value, or null if absent / unparseable.
     */
    get: function (key) {
      try { return JSON.parse(localStorage.getItem(prefix + key)); } catch (e) { return null; }
    },

    /**
     * Persist a value under the given key.
     * @param {string} key
     * @param {*}      value  Must be JSON-serialisable.
     */
    set: function (key, value) {
      try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch (e) { /* ignore quota errors */ }
    },

    /**
     * Delete a stored key.
     * @param {string} key
     */
    remove: function (key) {
      try { localStorage.removeItem(prefix + key); } catch (e) { /* ignore */ }
    }
  };

})(window);
