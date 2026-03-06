/**
 * ICO App – Report Service
 *
 * Provides read-only aggregations (summary statistics, breakdowns) and the
 * data-management operations required by the Settings page (export, import,
 * reset).  All data is sourced exclusively through the other service
 * interfaces – this module never reads localStorage directly.
 *
 * Phase 4 migration guide:
 *   • getSummary() → replace with a Supabase RPC or a set of COUNT/SUM
 *     queries against the `activities` and `payments` tables.
 *   • exportAll()  → fetch all rows from each table and bundle them.
 *   • importAll()  → UPSERT rows into each table (with RLS).
 *   • resetAll()   → DELETE all rows and re-seed via the service methods.
 *
 * @namespace ICO.ReportService
 *
 * Interface:
 *   getSummary()    → SummaryStats
 *   exportAll()     → ExportBundle
 *   importAll(data) → void   (throws on invalid input)
 *   resetAll()      → void
 *
 * SummaryStats shape:
 *   activitiesCount  number
 *   completedCount   number
 *   inProgressCount  number
 *   pendingCount     number
 *   paymentsCount    number
 *   totalPaid        number
 *   totalPending     number
 *   totalRemaining   number
 *   totalSpent       number   (alias for totalPaid)
 *
 * ExportBundle shape:
 *   exportedAt  string   ISO 8601
 *   version     number   Schema version (currently 1)
 *   profiles    Profile[]
 *   activities  Activity[]
 *   payments    Payment[]
 *   auditLog    AuditEntry[]
 */
(function (root) {
  'use strict';

  var ICO = root.ICO = root.ICO || {};

  ICO.ReportService = {
    /**
     * Compute high-level summary statistics across all activities and payments.
     * @returns {SummaryStats}
     */
    getSummary: function () {
      var acts = ICO.ActivityService.getAll();
      var pays = ICO.PaymentService.getAll();
      var totalPaid      = pays.filter(function (p) { return p.status === 'paid'; })
                              .reduce(function (s, p) { return s + Number(p.amount); }, 0);
      var totalPending   = pays.filter(function (p) { return p.status === 'pending'; })
                              .reduce(function (s, p) { return s + Number(p.amount); }, 0);
      var totalRemaining = pays.reduce(function (s, p) { return s + Number(p.remaining || 0); }, 0);
      return {
        activitiesCount: acts.length,
        completedCount:  acts.filter(function (a) { return a.status === 'completed'; }).length,
        inProgressCount: acts.filter(function (a) { return a.status === 'in_progress'; }).length,
        pendingCount:    acts.filter(function (a) { return a.status === 'pending'; }).length,
        paymentsCount:   pays.length,
        totalPaid:       totalPaid,
        totalPending:    totalPending,
        totalRemaining:  totalRemaining,
        totalSpent:      totalPaid   // convenience alias
      };
    },

    /**
     * Bundle all data into a JSON-serialisable export object.
     * @returns {ExportBundle}
     */
    exportAll: function () {
      return {
        exportedAt:  ICO.nowISO(),
        version:     1,
        profiles:    ICO.AuthService.getAll(),
        activities:  ICO.ActivityService.getAll(),
        payments:    ICO.PaymentService.getAll(),
        auditLog:    ICO.AuditService.getAll()
      };
    },

    /**
     * Import data from a previously exported bundle.
     * Only present top-level keys are overwritten; missing keys are ignored.
     * @param {ExportBundle} data
     * @throws {Error} When data is not a plain object.
     */
    importAll: function (data) {
      if (!data || typeof data !== 'object') throw new Error('Invalid import data');
      if (data.profiles)   ICO.AuthService._import(data.profiles);
      if (data.activities) ICO.ActivityService._import(data.activities);
      if (data.payments)   ICO.PaymentService._import(data.payments);
      if (data.auditLog)   ICO.StorageService.set('audit_log', data.auditLog);
    },

    /**
     * Erase all persisted data and restore the original seed records.
     * The audit log is cleared as part of the reset.
     */
    resetAll: function () {
      ICO.AuthService._reset();
      ICO.ActivityService._reset();
      ICO.PaymentService._reset();
      ICO.AuditService.clear();
    }
  };

})(window);
