/**
 * ICO App – Data Layer  (backward-compatibility shim)
 *
 * ICO.DB is retained so that app.js continues to work without changes.
 * Internally every method delegates to the appropriate service module:
 *
 *   ICO.StorageService   – key/value persistence
 *   ICO.AuditService     – audit log
 *   ICO.AuthService      – profiles / session events
 *   ICO.ActivityService  – renovation activities
 *   ICO.PaymentService   – financial payments
 *   ICO.ReportService    – summary stats, export, import, reset
 *
 * New code should call those service interfaces directly rather than
 * going through ICO.DB.
 */
(function (root) {
  'use strict';

  var ICO = root.ICO = root.ICO || {};

  /* ── helpers ─────────────────────────────────────────────── */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  /* ── localStorage wrapper ────────────────────────────────── */
  var Store = {
    get: function (key) {
      try { return JSON.parse(localStorage.getItem('ico_' + key)); } catch (e) { return null; }
    },
    set: function (key, val) {
      try { localStorage.setItem('ico_' + key, JSON.stringify(val)); } catch (e) { /* ignore */ }
    }
  };

  /* ── SEED DATA ───────────────────────────────────────────── */
  var SEED_PROFILES = [
    { id: 'profile_1', name: 'Alex Renovator', initials: 'AR', role: 'Project Manager', createdAt: '2025-01-10T09:00:00.000Z' },
    { id: 'profile_2', name: 'Jordan Builder', initials: 'JB', role: 'Site Coordinator', createdAt: '2025-01-10T09:05:00.000Z' }
  ];

  var SEED_ACTIVITIES = [
    {
      id: 'act_001', title: 'Kitchen Demolition',
      category: 'Demolition', date: '2025-03-01', status: 'completed',
      contractor: 'FastDemo Ltd',
      paymentAmount: 2400, paymentType: 'bank_transfer', remaining: 0,
      notes: 'Completed ahead of schedule.', createdAt: '2025-03-01T08:00:00.000Z', updatedAt: '2025-03-05T14:00:00.000Z'
    },
    {
      id: 'act_002', title: 'Bathroom Retiling',
      category: 'Tiling', date: '2025-03-08', status: 'in_progress',
      contractor: 'TilePro',
      paymentAmount: 800, paymentType: 'cash', remaining: 1200,
      notes: '', createdAt: '2025-03-06T10:00:00.000Z', updatedAt: '2025-03-06T10:00:00.000Z'
    },
    {
      id: 'act_003', title: 'Electrical Rewiring',
      category: 'Electrical', date: '2025-03-15', status: 'pending',
      contractor: 'Voltix Electrics',
      paymentAmount: 0, paymentType: 'bank_transfer', remaining: 3500,
      notes: 'Awaiting council permit.', createdAt: '2025-03-07T09:00:00.000Z', updatedAt: '2025-03-07T09:00:00.000Z'
    },
    {
      id: 'act_004', title: 'Flooring – Living Room',
      category: 'Flooring', date: '2025-03-20', status: 'pending',
      contractor: 'FloorZone',
      paymentAmount: 0, paymentType: 'cash', remaining: 0,
      notes: '', createdAt: '2025-03-07T10:00:00.000Z', updatedAt: '2025-03-07T10:00:00.000Z'
    },
    {
      id: 'act_005', title: 'Plastering & Skim Coat',
      category: 'Plastering', date: '2025-03-25', status: 'pending',
      contractor: 'SmoothWalls Co.',
      paymentAmount: 0, paymentType: 'cash', remaining: 0,
      notes: '', createdAt: '2025-03-07T10:30:00.000Z', updatedAt: '2025-03-07T10:30:00.000Z'
    }
  ];

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

  /* ── Data Service ────────────────────────────────────────── */
  var DB = {
    /* ----- Profiles ----- */
    getProfiles:    function ()     { return ICO.AuthService.getAll(); },
    saveProfiles:   function (list) { ICO.StorageService.set('profiles', list); },
    createProfile:  function (data) { return ICO.AuthService.create(data); },
    getProfileById: function (id)   { return ICO.AuthService.getById(id); },

    /* ----- Activities ----- */
    getActivities:   function ()               { return ICO.ActivityService.getAll(); },
    saveActivities:  function (list)           { ICO.StorageService.set('activities', list); },
    createActivity:  function (data, userId)   { return ICO.ActivityService.create(data, userId); },
    updateActivity:  function (id, data, userId) { return ICO.ActivityService.update(id, data, userId); },
    deleteActivity:  function (id, userId)     { ICO.ActivityService.remove(id, userId); },
    getActivityById: function (id)             { return ICO.ActivityService.getById(id); },

    /* ----- Payments ----- */
    getPayments:    function ()                { return ICO.PaymentService.getAll(); },
    savePayments:   function (list)            { ICO.StorageService.set('payments', list); },
    createPayment:  function (data, userId)    { return ICO.PaymentService.create(data, userId); },
    updatePayment:  function (id, data, userId) { return ICO.PaymentService.update(id, data, userId); },
    deletePayment:  function (id, userId)      { ICO.PaymentService.remove(id, userId); },
    getPaymentById: function (id)              { return ICO.PaymentService.getById(id); },

    /* ----- Audit Log ----- */
    getAuditLog:  function () { return ICO.AuditService.getAll(); },
    audit:        function (action, entity, entityId, entityName, detail, userId, prevSnapshot, newSnapshot) {
      ICO.AuditService.log(action, entity, entityId, entityName, detail, userId, prevSnapshot, newSnapshot);
    },
    clearAuditLog: function () { ICO.AuditService.clear(); },

    /* ----- Derived / Reporting ----- */
    getSummary: function () {
      var acts = DB.getActivities();
      var totalPaid      = acts.reduce(function (s, a) { return s + Number(a.paymentAmount || 0); }, 0);
      var totalRemaining = acts.reduce(function (s, a) { return s + Number(a.remaining || 0); }, 0);
      return {
        activitiesCount: acts.length,
        completedCount: acts.filter(function (a) { return a.status === 'completed'; }).length,
        inProgressCount: acts.filter(function (a) { return a.status === 'in_progress'; }).length,
        pendingCount: acts.filter(function (a) { return a.status === 'pending'; }).length,
        totalPaid: totalPaid,
        totalRemaining: totalRemaining,
        totalSpent: totalPaid
      };
    },

    /* ----- Settings: Export / Import / Reset ----- */
    exportAllData: function ()       { return ICO.ReportService.exportAll(); },
    importAllData: function (data)   { ICO.ReportService.importAll(data); },
    resetAllData:  function ()       { ICO.ReportService.resetAll(); }
  };

  ICO.DB = DB;

})(window);
