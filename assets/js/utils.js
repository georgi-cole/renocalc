/**
 * ICO App – Shared Utilities
 *
 * Provides ID generation, date helpers, and display-formatting functions
 * used throughout the application.  All symbols are attached to the ICO
 * namespace so that every module (services and UI alike) can access them
 * without duplicating logic.
 */
(function (root) {
  'use strict';

  var ICO = root.ICO = root.ICO || {};

  /* ── ID & date helpers ───────────────────────────────────────── */

  /** Generate a short random unique identifier. */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /** Return today's date as YYYY-MM-DD. */
  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  /** Return the current date-time as an ISO 8601 string. */
  function nowISO() {
    return new Date().toISOString();
  }

  /* ── Display-format helpers ──────────────────────────────────── */

  var fmt = {
    /** Format a number as a EUR currency string (e.g. €1,200.00). */
    currency: function (n) {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(n || 0));
    },

    /** Format an ISO date string as a human-readable date (e.g. 1 Mar 2025). */
    date: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso.slice(0, 10) + 'T12:00:00Z');
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    /** Format an ISO datetime string as date + time (e.g. 1 Mar 2025 09:00). */
    datetime: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
           + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    },

    /** Return a human-relative time string (e.g. "3h ago", "just now"). */
    relativeTime: function (iso) {
      if (!iso) return '';
      var diff = Date.now() - new Date(iso).getTime();
      var s = Math.floor(diff / 1000);
      if (s < 60)  return 'just now';
      var m = Math.floor(s / 60);
      if (m < 60)  return m + 'm ago';
      var h = Math.floor(m / 60);
      if (h < 24)  return h + 'h ago';
      var days = Math.floor(h / 24);
      if (days < 7) return days + 'd ago';
      return fmt.date(iso);
    },

    /** Derive 1–2 uppercase initials from a full name. */
    initials: function (name) {
      return (name || '?').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    }
  };

  /* ── Expose ──────────────────────────────────────────────────── */
  ICO.uid    = uid;
  ICO.today  = today;
  ICO.nowISO = nowISO;
  ICO.fmt    = fmt;

})(window);
