/**
 * ICO App – Supabase Activity Service
 *
 * Overrides ICO.ActivityService with a Supabase-backed implementation when
 * ICO.SupabaseClient is available.  Falls back to the local implementation
 * loaded earlier if no Supabase client exists.
 *
 * Table: activities
 *   id             text primary key default gen_random_uuid()::text
 *   date           date
 *   title          text not null
 *   category       text
 *   payment_amount numeric default 0
 *   payment_type   text
 *   remaining      numeric default 0
 *   currency       text default 'GBP'
 *   who_paid       text
 *   status         text default 'pending'
 *   supplier       text
 *   notes          text
 *   created_at     timestamptz default now()
 *   updated_at     timestamptz default now()
 *   created_by     text  (profile id of creator)
 *   updated_by     text  (profile id of last editor)
 *
 * The in-memory cache is populated asynchronously on load.  All synchronous
 * read calls use the cache; mutations update the cache immediately and flush
 * to Supabase async so the UI stays responsive.
 *
 * All create / update / delete operations write an audit record via
 * ICO.AuditService centralising audit responsibility in the service layer.
 *
 * @namespace ICO.ActivityService  (replaced when Supabase configured)
 */
(function (root) {
  'use strict';

  var ICO = root.ICO = root.ICO || {};

  // Only override when a Supabase client is present.
  if (!ICO.SupabaseClient) { return; }

  var sb = ICO.SupabaseClient;
  var TABLE = 'activities';

  /** In-memory cache of all activities. */
  var _cache = [];
  var _ready = false;

  /** Fetch all activities from Supabase into the local cache. */
  function _load() {
    sb.from(TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .then(function (res) {
        if (res.error) {
          console.error('[ICO:ActivityService] Load error:', res.error.message);
        } else {
          _cache = (res.data || []).map(_fromRow);
          _ready = true;
          console.info('[ICO:ActivityService] Loaded ' + _cache.length + ' activities from Supabase.');
        }
      });
  }

  /** Map a DB row to the internal Activity shape. */
  function _fromRow(row) {
    return {
      id:            row.id,
      title:         row.title,
      category:      row.category    || '',
      date:          row.date        || '',
      status:        row.status      || 'pending',
      contractor:    row.supplier    || '',
      paymentAmount: Number(row.payment_amount || 0),
      paymentType:   row.payment_type || '',
      remaining:     Number(row.remaining || 0),
      currency:      row.currency    || 'GBP',
      whoPaid:       row.who_paid    || '',
      notes:         row.notes       || '',
      createdAt:     row.created_at,
      updatedAt:     row.updated_at,
      createdBy:     row.created_by  || null,
      updatedBy:     row.updated_by  || null
    };
  }

  /** Map an internal Activity to a DB row for INSERT / UPDATE. */
  function _toRow(activity) {
    return {
      id:             activity.id,
      title:          activity.title,
      category:       activity.category    || '',
      date:           activity.date        || null,
      status:         activity.status      || 'pending',
      supplier:       activity.contractor  || '',
      payment_amount: Number(activity.paymentAmount || 0),
      payment_type:   activity.paymentType || '',
      remaining:      Number(activity.remaining || 0),
      currency:       activity.currency    || 'GBP',
      who_paid:       activity.whoPaid     || '',
      notes:          activity.notes       || '',
      created_at:     activity.createdAt,
      updated_at:     activity.updatedAt,
      created_by:     activity.createdBy   || null,
      updated_by:     activity.updatedBy   || null
    };
  }

  ICO.ActivityService = {
    /**
     * Return all activities (from cache).
     * @returns {Activity[]}
     */
    getAll: function () {
      return _cache;
    },

    /**
     * Find a single activity by its ID.
     * @param  {string} id
     * @returns {Activity|undefined}
     */
    getById: function (id) {
      return _cache.find(function (a) { return a.id === id; });
    },

    /**
     * Create and persist a new activity.
     * Updates cache immediately; flushes to Supabase async.
     * Writes an audit record via ICO.AuditService.
     *
     * @param  {object}      data
     * @param  {string|null} userId  Acting user's profile ID
     * @returns {Activity}
     */
    create: function (data, userId) {
      var activity = Object.assign(
        {
          id:        'act_' + ICO.uid(),
          createdAt: ICO.nowISO(),
          updatedAt: ICO.nowISO(),
          createdBy: userId || null,
          updatedBy: userId || null
        },
        data
      );

      _cache.unshift(activity);

      sb.from(TABLE).insert(_toRow(activity)).then(function (res) {
        if (res.error) {
          console.error('[ICO:ActivityService] Insert error:', res.error.message);
        }
      });

      ICO.AuditService.log('create', 'Activity', activity.id, activity.title, 'Activity created', userId, null, activity);
      return activity;
    },

    /**
     * Update an existing activity.
     * @param  {string}      id
     * @param  {object}      data    Fields to merge
     * @param  {string|null} userId
     * @returns {Activity|null}
     */
    update: function (id, data, userId) {
      var idx = _cache.findIndex(function (a) { return a.id === id; });
      if (idx === -1) { return null; }

      var prev = Object.assign({}, _cache[idx]);
      _cache[idx] = Object.assign({}, prev, data, {
        id:        id,
        updatedAt: ICO.nowISO(),
        updatedBy: userId || null
      });

      var updated = _cache[idx];
      sb.from(TABLE).update(_toRow(updated)).eq('id', id).then(function (res) {
        if (res.error) {
          console.error('[ICO:ActivityService] Update error:', res.error.message);
        }
      });

      ICO.AuditService.log('update', 'Activity', id, updated.title, 'Activity updated', userId, prev, updated);
      return updated;
    },

    /**
     * Permanently delete an activity.
     * @param {string}      id
     * @param {string|null} userId
     */
    remove: function (id, userId) {
      var activity = _cache.find(function (x) { return x.id === id; });
      _cache = _cache.filter(function (x) { return x.id !== id; });

      sb.from(TABLE).delete().eq('id', id).then(function (res) {
        if (res.error) {
          console.error('[ICO:ActivityService] Delete error:', res.error.message);
        }
      });

      if (activity) {
        ICO.AuditService.log('delete', 'Activity', id, activity.title, 'Activity deleted', userId, activity, null);
      }
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
          console.error('[ICO:ActivityService] Import upsert error:', res.error.message);
        }
      });
    },

    /**
     * Clear all activities in Supabase and reset the cache
     * (used by ReportService.resetAll).
     */
    _reset: function () {
      _cache = [];
      sb.from(TABLE).delete().neq('id', '').then(function (res) {
        if (res.error) {
          console.error('[ICO:ActivityService] Reset delete error:', res.error.message);
        }
      });
    }
  };

  // Kick off the initial data load.
  _load();

})(window);
