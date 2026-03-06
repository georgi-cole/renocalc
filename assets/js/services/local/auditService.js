/**
 * ICO App – Audit Service
 *
 * Maintains an append-only log of every create / update / delete / login /
 * logout action performed in the application.  All service modules call
 * ICO.AuditService.log() immediately after each mutation.
 *
 * Phase 4 migration guide:
 *   Replace StorageService calls with INSERTs into a Supabase `audit_log`
 *   table.  Row-Level Security should allow only INSERT (never UPDATE or
 *   DELETE) so the log remains tamper-proof.
 *
 * @namespace ICO.AuditService
 *
 * Interface:
 *   log(action, entity, entityId, entityName, detail, userId,
 *       prevSnapshot, newSnapshot) → void
 *   getAll()                       → AuditEntry[]
 *   clear()                        → void
 *
 * AuditEntry shape:
 *   id            string   'aud_<uid>'
 *   ts            string   ISO 8601 timestamp
 *   action        string   'create' | 'update' | 'delete' | 'login' | 'logout'
 *   entity        string   'Activity' | 'Payment' | 'Profile'
 *   entityId      string
 *   entityName    string
 *   detail        string   Human-readable description
 *   userId        string | null
 *   prevSnapshot  object | null
 *   newSnapshot   object | null
 */
(function (root) {
  'use strict';

  var ICO = root.ICO = root.ICO || {};

  var MAX_ENTRIES = 500;

  ICO.AuditService = {
    /**
     * Append one entry to the audit log.
     *
     * @param {string}      action        'create' | 'update' | 'delete' | 'login' | 'logout'
     * @param {string}      entity        'Activity' | 'Payment' | 'Profile'
     * @param {string}      entityId
     * @param {string}      entityName
     * @param {string}      detail        Human-readable description of the change
     * @param {string|null} userId        Profile ID of the acting user
     * @param {object|null} prevSnapshot  Entity state before the mutation (update / delete)
     * @param {object|null} newSnapshot   Entity state after the mutation (create / update)
     */
    log: function (action, entity, entityId, entityName, detail, userId, prevSnapshot, newSnapshot) {
      var log = ICO.StorageService.get('audit_log') || [];
      log.unshift({
        id:           'aud_' + ICO.uid(),
        ts:           ICO.nowISO(),
        action:       action,
        entity:       entity,
        entityId:     entityId,
        entityName:   entityName   || '',
        detail:       detail       || '',
        userId:       userId       || null,
        prevSnapshot: prevSnapshot || null,
        newSnapshot:  newSnapshot  || null
      });
      if (log.length > MAX_ENTRIES) log = log.slice(0, MAX_ENTRIES);
      ICO.StorageService.set('audit_log', log);
    },

    /**
     * Return the complete audit log, most-recent entry first.
     * @returns {AuditEntry[]}
     */
    getAll: function () {
      return ICO.StorageService.get('audit_log') || [];
    },

    /** Permanently remove all audit log entries. */
    clear: function () {
      ICO.StorageService.set('audit_log', []);
    }
  };

})(window);
