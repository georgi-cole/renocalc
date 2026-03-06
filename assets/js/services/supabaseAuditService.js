/**
 * ICO App – Supabase Audit Service
 *
 * Overrides ICO.AuditService with a Supabase-backed implementation when
 * ICO.SupabaseClient is available.  Falls back to the local implementation
 * loaded earlier if no Supabase client exists.
 *
 * Table: audit_logs
 *   id          text primary key default gen_random_uuid()::text
 *   timestamp   timestamptz default now()
 *   user_id     text
 *   user_name   text
 *   entity      text
 *   entity_id   text
 *   action      text
 *   summary     text
 *   previous    jsonb
 *   next        jsonb
 *   comment     text
 *
 * The in-memory cache (_cache) keeps the last 500 entries and is populated
 * asynchronously on first access.  All synchronous read calls (getAll) draw
 * from this cache; write calls update the cache immediately and flush to
 * Supabase asynchronously.
 *
 * @namespace ICO.AuditService  (replaced when Supabase configured)
 */
(function (root) {
  'use strict';

  var ICO = root.ICO = root.ICO || {};

  // Only override when a Supabase client is present.
  if (!ICO.SupabaseClient) { return; }

  var sb = ICO.SupabaseClient;
  var TABLE = 'audit_logs';
  var MAX_ENTRIES = 500;

  /** In-memory cache – most-recent entry first. */
  var _cache = [];
  var _ready = false;

  /** Fetch the latest audit entries from Supabase into the local cache. */
  function _load() {
    sb.from(TABLE)
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(MAX_ENTRIES)
      .then(function (res) {
        if (res.error) {
          console.error('[ICO:AuditService] Load error:', res.error.message);
        } else {
          _cache = (res.data || []).map(_fromRow);
          _ready = true;
          console.info('[ICO:AuditService] Loaded ' + _cache.length + ' audit entries from Supabase.');
        }
      });
  }

  /** Map a DB row to the internal AuditEntry shape. */
  function _fromRow(row) {
    return {
      id:           row.id,
      ts:           row.timestamp,
      action:       row.action,
      entity:       row.entity,
      entityId:     row.entity_id,
      entityName:   row.user_name || '',
      detail:       row.summary   || '',
      userId:       row.user_id   || null,
      prevSnapshot: row.previous  || null,
      newSnapshot:  row.next      || null
    };
  }

  /** Map an internal AuditEntry to a DB row for INSERT. */
  function _toRow(entry) {
    return {
      id:        entry.id,
      timestamp: entry.ts,
      action:    entry.action,
      entity:    entry.entity,
      entity_id: entry.entityId,
      user_name: entry.entityName || '',
      summary:   entry.detail     || '',
      user_id:   entry.userId     || null,
      previous:  entry.prevSnapshot || null,
      next:      entry.newSnapshot  || null,
      comment:   null
    };
  }

  ICO.AuditService = {
    /**
     * Append one entry to the audit log.
     * Updates the in-memory cache immediately; persists to Supabase async.
     */
    log: function (action, entity, entityId, entityName, detail, userId, prevSnapshot, newSnapshot) {
      var entry = {
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
      };

      _cache.unshift(entry);
      if (_cache.length > MAX_ENTRIES) { _cache = _cache.slice(0, MAX_ENTRIES); }

      sb.from(TABLE).insert(_toRow(entry)).then(function (res) {
        if (res.error) {
          console.error('[ICO:AuditService] Insert error:', res.error.message);
        }
      });
    },

    /**
     * Return all cached audit entries, most-recent first.
     * @returns {AuditEntry[]}
     */
    getAll: function () {
      return _cache;
    },

    /** Clear all audit log entries locally and in Supabase. */
    clear: function () {
      _cache = [];
      sb.from(TABLE).delete().neq('id', '').then(function (res) {
        if (res.error) {
          console.error('[ICO:AuditService] Clear error:', res.error.message);
        }
      });
    },

    /**
     * Overwrite cache and sync to Supabase (used by ReportService.importAll).
     * Upserts all entries so existing rows are not duplicated.
     */
    _import: function (list) {
      _cache = list;
      if (!list || !list.length) { return; }
      var rows = list.map(_toRow);
      sb.from(TABLE).upsert(rows).then(function (res) {
        if (res.error) {
          console.error('[ICO:AuditService] Import upsert error:', res.error.message);
        }
      });
    }
  };

  // Kick off the initial data load.
  _load();

})(window);
