/**
 * ICO App – Storage & Data Layer
 * All data is persisted in localStorage so the app works offline / between sessions.
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
    getProfiles: function () {
      return Store.get('profiles') || JSON.parse(JSON.stringify(SEED_PROFILES));
    },
    saveProfiles: function (list) {
      Store.set('profiles', list);
    },
    createProfile: function (data) {
      var list = DB.getProfiles();
      var p = Object.assign({ id: 'profile_' + uid(), createdAt: nowISO() }, data);
      list.push(p);
      DB.saveProfiles(list);
      DB.audit('create', 'Profile', p.id, p.name, 'Profile created');
      return p;
    },
    getProfileById: function (id) {
      return DB.getProfiles().find(function (p) { return p.id === id; });
    },

    /* ----- Activities ----- */
    getActivities: function () {
      return Store.get('activities') || JSON.parse(JSON.stringify(SEED_ACTIVITIES));
    },
    saveActivities: function (list) {
      Store.set('activities', list);
    },
    createActivity: function (data, userId) {
      var list = DB.getActivities();
      var a = Object.assign({ id: 'act_' + uid(), createdAt: nowISO(), updatedAt: nowISO() }, data);
      list.push(a);
      DB.saveActivities(list);
      DB.audit('create', 'Activity', a.id, a.title, 'Activity created', userId, null, a);
      return a;
    },
    updateActivity: function (id, data, userId) {
      var list = DB.getActivities();
      var idx = list.findIndex(function (a) { return a.id === id; });
      if (idx === -1) return null;
      var prev = Object.assign({}, list[idx]);
      list[idx] = Object.assign({}, prev, data, { id: id, updatedAt: nowISO() });
      DB.saveActivities(list);
      DB.audit('update', 'Activity', id, list[idx].title, 'Activity updated', userId, prev, list[idx]);
      return list[idx];
    },
    deleteActivity: function (id, userId) {
      var list = DB.getActivities();
      var a = list.find(function (x) { return x.id === id; });
      DB.saveActivities(list.filter(function (x) { return x.id !== id; }));
      if (a) DB.audit('delete', 'Activity', id, a.title, 'Activity deleted', userId, a, null);
    },
    getActivityById: function (id) {
      return DB.getActivities().find(function (a) { return a.id === id; });
    },

    /* ----- Payments ----- */
    getPayments: function () {
      return Store.get('payments') || JSON.parse(JSON.stringify(SEED_PAYMENTS));
    },
    savePayments: function (list) {
      Store.set('payments', list);
    },
    createPayment: function (data, userId) {
      var list = DB.getPayments();
      var p = Object.assign({ id: 'pay_' + uid(), createdAt: nowISO(), updatedAt: nowISO() }, data);
      list.push(p);
      DB.savePayments(list);
      DB.audit('create', 'Payment', p.id, p.reference || 'Payment', 'Payment of ' + ICO.fmt.currency(p.amount) + ' created', userId, null, p);
      return p;
    },
    updatePayment: function (id, data, userId) {
      var list = DB.getPayments();
      var idx = list.findIndex(function (p) { return p.id === id; });
      if (idx === -1) return null;
      var prev = Object.assign({}, list[idx]);
      list[idx] = Object.assign({}, prev, data, { id: id, updatedAt: nowISO() });
      DB.savePayments(list);
      DB.audit('update', 'Payment', id, list[idx].reference || 'Payment', 'Payment updated', userId, prev, list[idx]);
      return list[idx];
    },
    deletePayment: function (id, userId) {
      var list = DB.getPayments();
      var p = list.find(function (x) { return x.id === id; });
      DB.savePayments(list.filter(function (x) { return x.id !== id; }));
      if (p) DB.audit('delete', 'Payment', id, p.reference || 'Payment', 'Payment deleted', userId, p, null);
    },
    getPaymentById: function (id) {
      return DB.getPayments().find(function (p) { return p.id === id; });
    },

    /* ----- Audit Log ----- */
    getAuditLog: function () {
      return Store.get('audit_log') || [];
    },
    audit: function (action, entity, entityId, entityName, detail, userId, prevSnapshot, newSnapshot) {
      var log = DB.getAuditLog();
      log.unshift({
        id: 'aud_' + uid(),
        ts: nowISO(),
        action: action,   // create | update | delete | login | logout
        entity: entity,   // Activity | Payment | Profile
        entityId: entityId,
        entityName: entityName || '',
        detail: detail || '',
        userId: userId || null,
        prevSnapshot: prevSnapshot || null,
        newSnapshot: newSnapshot || null
      });
      // keep latest 500 entries
      if (log.length > 500) log = log.slice(0, 500);
      Store.set('audit_log', log);
    },
    clearAuditLog: function () {
      Store.set('audit_log', []);
    },

    /* ----- Derived / Reporting ----- */
    getSummary: function () {
      var acts = DB.getActivities();
      var pays = DB.getPayments();
      var totalPaid = pays.filter(function (p) { return p.status === 'paid'; })
                         .reduce(function (s, p) { return s + Number(p.amount); }, 0);
      var totalPending = pays.filter(function (p) { return p.status === 'pending'; })
                            .reduce(function (s, p) { return s + Number(p.amount); }, 0);
      var totalRemaining = pays.reduce(function (s, p) { return s + Number(p.remaining || 0); }, 0);
      return {
        activitiesCount: acts.length,
        completedCount: acts.filter(function (a) { return a.status === 'completed'; }).length,
        inProgressCount: acts.filter(function (a) { return a.status === 'in_progress'; }).length,
        pendingCount: acts.filter(function (a) { return a.status === 'pending'; }).length,
        paymentsCount: pays.length,
        totalPaid: totalPaid,
        totalPending: totalPending,
        totalRemaining: totalRemaining,
        totalSpent: totalPaid
      };
    },

    /* ----- Settings: Export / Import / Reset ----- */
    exportAllData: function () {
      return {
        exportedAt: nowISO(),
        version: 1,
        profiles:   DB.getProfiles(),
        activities: DB.getActivities(),
        payments:   DB.getPayments(),
        auditLog:   DB.getAuditLog()
      };
    },
    importAllData: function (data) {
      if (!data || typeof data !== 'object') throw new Error('Invalid data');
      if (data.profiles)   Store.set('profiles',   data.profiles);
      if (data.activities) Store.set('activities', data.activities);
      if (data.payments)   Store.set('payments',   data.payments);
      if (data.auditLog)   Store.set('audit_log',  data.auditLog);
    },
    resetAllData: function () {
      Store.set('profiles',   SEED_PROFILES);
      Store.set('activities', SEED_ACTIVITIES);
      Store.set('payments',   SEED_PAYMENTS);
      Store.set('audit_log',  []);
    }
  };

  /* ── Format helpers ──────────────────────────────────────── */
  var fmt = {
    currency: function (n) {
      return '£' + Number(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    date: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso.slice(0, 10) + 'T12:00:00Z');
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    datetime: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
           + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    },
    relativeTime: function (iso) {
      if (!iso) return '';
      var diff = Date.now() - new Date(iso).getTime();
      var s = Math.floor(diff / 1000);
      if (s < 60) return 'just now';
      var m = Math.floor(s / 60);
      if (m < 60) return m + 'm ago';
      var h = Math.floor(m / 60);
      if (h < 24) return h + 'h ago';
      var days = Math.floor(h / 24);
      if (days < 7) return days + 'd ago';
      return fmt.date(iso);
    },
    initials: function (name) {
      return (name || '?').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    }
  };

  /* ── Expose ──────────────────────────────────────────────── */
  ICO.DB  = DB;
  ICO.fmt = fmt;
  ICO.uid = uid;
  ICO.today = today;
  ICO.nowISO = nowISO;

})(window);
