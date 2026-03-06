/**
 * ICO App – Payment Service
 *
 * Provides CRUD operations for financial payments.  Every mutation is
 * automatically reflected in the audit log via ICO.AuditService.
 *
 * Phase 4 migration guide:
 *   • getAll()           → SELECT * FROM payments (RLS scoped to project)
 *   • getById(id)        → SELECT * FROM payments WHERE id = :id
 *   • create(data, uid)  → INSERT INTO payments; INSERT INTO audit_log
 *   • update(id, d, uid) → UPDATE payments SET … WHERE id = :id; audit
 *   • remove(id, uid)    → DELETE FROM payments WHERE id = :id; audit
 *
 * @namespace ICO.PaymentService
 *
 * Interface:
 *   getAll()                    → Payment[]
 *   getById(id)                 → Payment | undefined
 *   create(data, userId)        → Payment
 *   update(id, data, userId)    → Payment | null
 *   remove(id, userId)          → void
 *
 * Payment entity shape:
 *   id          string   'pay_<uid>'
 *   date        string   YYYY-MM-DD
 *   amount      number
 *   paidBy      string   Profile ID
 *   method      string   bank_transfer | cash | card | cheque | other
 *   status      string   paid | pending | partial | overdue
 *   activityId  string   Linked Activity ID (may be empty)
 *   reference   string   Invoice / receipt reference
 *   notes       string
 *   remaining   number   Outstanding balance for this payment
 *   createdAt   string   ISO 8601
 *   updatedAt   string   ISO 8601
 */
(function (root) {
  'use strict';

  var ICO = root.ICO = root.ICO || {};

  /** Seed payments used when no persisted data exists. */
  var SEED_PAYMENTS = [
    {
      id: 'pay_001', date: '2025-03-01', amount: 2400, paidBy: 'profile_1',
      method: 'bank_transfer', status: 'paid',
      activityId: 'act_001', reference: 'INV-2025-0301',
      notes: 'Full payment for kitchen demolition.', remaining: 0,
      createdAt: '2025-03-01T12:00:00.000Z', updatedAt: '2025-03-01T12:00:00.000Z'
    },
    {
      id: 'pay_002', date: '2025-03-08', amount: 800, paidBy: 'profile_2',
      method: 'cash', status: 'paid',
      activityId: 'act_002', reference: 'RCP-2025-033',
      notes: 'Deposit for bathroom tiling.', remaining: 1200,
      createdAt: '2025-03-08T09:00:00.000Z', updatedAt: '2025-03-08T09:00:00.000Z'
    },
    {
      id: 'pay_003', date: '2025-03-15', amount: 3500, paidBy: 'profile_1',
      method: 'bank_transfer', status: 'pending',
      activityId: 'act_003', reference: 'QUOT-VOLT-9812',
      notes: 'Quoted price for rewiring, awaiting invoice.', remaining: 3500,
      createdAt: '2025-03-07T11:00:00.000Z', updatedAt: '2025-03-07T11:00:00.000Z'
    },
    {
      id: 'pay_004', date: '2025-03-06', amount: 560, paidBy: 'profile_2',
      method: 'card', status: 'paid',
      activityId: '', reference: 'RCPT-MAT-102',
      notes: 'Materials purchase – adhesive, grout, tools.', remaining: 0,
      createdAt: '2025-03-06T15:00:00.000Z', updatedAt: '2025-03-06T15:00:00.000Z'
    }
  ];

  ICO.PaymentService = {
    /**
     * Return all payments.
     * Falls back to seed data when no payments have been persisted yet.
     * @returns {Payment[]}
     */
    getAll: function () {
      return ICO.StorageService.get('payments') || JSON.parse(JSON.stringify(SEED_PAYMENTS));
    },

    /**
     * Find a single payment by its ID.
     * @param  {string} id
     * @returns {Payment|undefined}
     */
    getById: function (id) {
      return ICO.PaymentService.getAll().find(function (p) { return p.id === id; });
    },

    /**
     * Create and persist a new payment.
     * @param  {object}      data
     * @param  {string|null} userId  Acting user's profile ID (for audit log)
     * @returns {Payment}
     */
    create: function (data, userId) {
      var list = ICO.PaymentService.getAll();
      var payment = Object.assign(
        { id: 'pay_' + ICO.uid(), createdAt: ICO.nowISO(), updatedAt: ICO.nowISO() },
        data
      );
      list.push(payment);
      ICO.StorageService.set('payments', list);
      ICO.AuditService.log(
        'create', 'Payment', payment.id, payment.reference || 'Payment',
        'Payment of ' + ICO.fmt.currency(payment.amount) + ' created',
        userId, null, payment
      );
      return payment;
    },

    /**
     * Update an existing payment.
     * @param  {string}      id
     * @param  {object}      data    Fields to merge (id and updatedAt are overwritten)
     * @param  {string|null} userId
     * @returns {Payment|null}  Returns null when the ID is not found.
     */
    update: function (id, data, userId) {
      var list = ICO.PaymentService.getAll();
      var idx = list.findIndex(function (p) { return p.id === id; });
      if (idx === -1) return null;
      var prev = Object.assign({}, list[idx]);
      list[idx] = Object.assign({}, prev, data, { id: id, updatedAt: ICO.nowISO() });
      ICO.StorageService.set('payments', list);
      ICO.AuditService.log('update', 'Payment', id, list[idx].reference || 'Payment', 'Payment updated', userId, prev, list[idx]);
      return list[idx];
    },

    /**
     * Permanently delete a payment.
     * @param {string}      id
     * @param {string|null} userId
     */
    remove: function (id, userId) {
      var list = ICO.PaymentService.getAll();
      var payment = list.find(function (x) { return x.id === id; });
      ICO.StorageService.set('payments', list.filter(function (x) { return x.id !== id; }));
      if (payment) ICO.AuditService.log('delete', 'Payment', id, payment.reference || 'Payment', 'Payment deleted', userId, payment, null);
    },

    // ── Internal helpers (used by ReportService for import/reset) ──────

    /** Overwrite the payments list (called by ReportService.importAll). */
    _import: function (list) {
      ICO.StorageService.set('payments', list);
    },

    /** Restore payments to seed data (called by ReportService.resetAll). */
    _reset: function () {
      ICO.StorageService.set('payments', JSON.parse(JSON.stringify(SEED_PAYMENTS)));
    }
  };

})(window);
