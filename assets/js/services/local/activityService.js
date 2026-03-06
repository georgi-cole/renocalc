/**
 * ICO App – Activity Service
 *
 * Provides CRUD operations for renovation activities.  Every mutation is
 * automatically reflected in the audit log via ICO.AuditService.
 *
 * Phase 4 migration guide:
 *   • getAll()           → SELECT * FROM activities (RLS scoped to project)
 *   • getById(id)        → SELECT * FROM activities WHERE id = :id
 *   • create(data, uid)  → INSERT INTO activities; INSERT INTO audit_log
 *   • update(id, d, uid) → UPDATE activities SET … WHERE id = :id; audit
 *   • remove(id, uid)    → DELETE FROM activities WHERE id = :id; audit
 *
 * @namespace ICO.ActivityService
 *
 * Interface:
 *   getAll()                    → Activity[]
 *   getById(id)                 → Activity | undefined
 *   create(data, userId)        → Activity
 *   update(id, data, userId)    → Activity | null
 *   remove(id, userId)          → void
 *
 * Activity entity shape:
 *   id           string   'act_<uid>'
 *   title        string
 *   category     string   Demolition | Electrical | Plumbing | Tiling |
 *                          Flooring | Plastering | Painting | Roofing |
 *                          Windows | Doors | Insulation | Other
 *   date         string   YYYY-MM-DD
 *   status       string   pending | in_progress | completed | cancelled
 *   responsible  string   Profile ID
 *   contractor   string
 *   description  string
 *   notes        string
 *   createdAt    string   ISO 8601
 *   updatedAt    string   ISO 8601
 */
(function (root) {
  'use strict';

  var ICO = root.ICO = root.ICO || {};

  /** Seed activities used when no persisted data exists. */
  var SEED_ACTIVITIES = [
    {
      id: 'act_001', title: 'Kitchen Demolition',
      category: 'Demolition', date: '2025-03-01', status: 'completed',
      responsible: 'profile_1', contractor: 'FastDemo Ltd',
      description: 'Full kitchen strip-out including cabinets, tiles and old plumbing.',
      notes: 'Completed ahead of schedule.', createdAt: '2025-03-01T08:00:00.000Z', updatedAt: '2025-03-05T14:00:00.000Z'
    },
    {
      id: 'act_002', title: 'Bathroom Retiling',
      category: 'Tiling', date: '2025-03-08', status: 'in_progress',
      responsible: 'profile_2', contractor: 'TilePro',
      description: 'Replace all bathroom tiles with premium porcelain.',
      notes: '', createdAt: '2025-03-06T10:00:00.000Z', updatedAt: '2025-03-06T10:00:00.000Z'
    },
    {
      id: 'act_003', title: 'Electrical Rewiring',
      category: 'Electrical', date: '2025-03-15', status: 'pending',
      responsible: 'profile_1', contractor: 'Voltix Electrics',
      description: 'Full rewiring of ground floor, new consumer unit.',
      notes: 'Awaiting council permit.', createdAt: '2025-03-07T09:00:00.000Z', updatedAt: '2025-03-07T09:00:00.000Z'
    },
    {
      id: 'act_004', title: 'Flooring – Living Room',
      category: 'Flooring', date: '2025-03-20', status: 'pending',
      responsible: 'profile_2', contractor: 'FloorZone',
      description: 'Install engineered hardwood throughout the living room.',
      notes: '', createdAt: '2025-03-07T10:00:00.000Z', updatedAt: '2025-03-07T10:00:00.000Z'
    },
    {
      id: 'act_005', title: 'Plastering & Skim Coat',
      category: 'Plastering', date: '2025-03-25', status: 'pending',
      responsible: 'profile_1', contractor: 'SmoothWalls Co.',
      description: 'Skim coat all walls, patch cracks.',
      notes: '', createdAt: '2025-03-07T10:30:00.000Z', updatedAt: '2025-03-07T10:30:00.000Z'
    }
  ];

  ICO.ActivityService = {
    /**
     * Return all activities.
     * Falls back to seed data when no activities have been persisted yet.
     * @returns {Activity[]}
     */
    getAll: function () {
      return ICO.StorageService.get('activities') || JSON.parse(JSON.stringify(SEED_ACTIVITIES));
    },

    /**
     * Find a single activity by its ID.
     * @param  {string} id
     * @returns {Activity|undefined}
     */
    getById: function (id) {
      return ICO.ActivityService.getAll().find(function (a) { return a.id === id; });
    },

    /**
     * Create and persist a new activity.
     * @param  {object}      data
     * @param  {string|null} userId  Acting user's profile ID (for audit log)
     * @returns {Activity}
     */
    create: function (data, userId) {
      var list = ICO.ActivityService.getAll();
      var activity = Object.assign(
        { id: 'act_' + ICO.uid(), createdAt: ICO.nowISO(), updatedAt: ICO.nowISO() },
        data
      );
      list.push(activity);
      ICO.StorageService.set('activities', list);
      ICO.AuditService.log('create', 'Activity', activity.id, activity.title, 'Activity created', userId, null, activity);
      return activity;
    },

    /**
     * Update an existing activity.
     * @param  {string}      id
     * @param  {object}      data    Fields to merge (id and updatedAt are overwritten)
     * @param  {string|null} userId
     * @returns {Activity|null}  Returns null when the ID is not found.
     */
    update: function (id, data, userId) {
      var list = ICO.ActivityService.getAll();
      var idx = list.findIndex(function (a) { return a.id === id; });
      if (idx === -1) return null;
      var prev = Object.assign({}, list[idx]);
      list[idx] = Object.assign({}, prev, data, { id: id, updatedAt: ICO.nowISO() });
      ICO.StorageService.set('activities', list);
      ICO.AuditService.log('update', 'Activity', id, list[idx].title, 'Activity updated', userId, prev, list[idx]);
      return list[idx];
    },

    /**
     * Permanently delete an activity.
     * @param {string}      id
     * @param {string|null} userId
     */
    remove: function (id, userId) {
      var list = ICO.ActivityService.getAll();
      var activity = list.find(function (x) { return x.id === id; });
      ICO.StorageService.set('activities', list.filter(function (x) { return x.id !== id; }));
      if (activity) ICO.AuditService.log('delete', 'Activity', id, activity.title, 'Activity deleted', userId, activity, null);
    },

    // ── Internal helpers (used by ReportService for import/reset) ──────

    /** Overwrite the activities list (called by ReportService.importAll). */
    _import: function (list) {
      ICO.StorageService.set('activities', list);
    },

    /** Restore activities to seed data (called by ReportService.resetAll). */
    _reset: function () {
      ICO.StorageService.set('activities', JSON.parse(JSON.stringify(SEED_ACTIVITIES)));
    }
  };

})(window);
