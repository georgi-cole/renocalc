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

  /**
   * @namespace ICO.DB
   * @deprecated  Use the individual ICO.*Service namespaces instead.
   *              ICO.DB will be removed when Supabase is integrated (Phase 4).
   */
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
    getSummary: function () { return ICO.ReportService.getSummary(); },

    /* ----- Settings: Export / Import / Reset ----- */
    exportAllData: function ()       { return ICO.ReportService.exportAll(); },
    importAllData: function (data)   { ICO.ReportService.importAll(data); },
    resetAllData:  function ()       { ICO.ReportService.resetAll(); }
  };

  ICO.DB = DB;

})(window);
