/**
 * ICO Renovation Reporting App – Main Application
 */
(function () {
  'use strict';

  var DB  = ICO.DB;
  var fmt = ICO.fmt;

  var APP_VERSION = (ICO.Config || {}).APP_VERSION || '3.0.0';

  /* ── State ────────────────────────────────────────────────── */
  var state = {
    currentUser: null,
    currentPage: 'dashboard',
    sidebarOpen: false
  };

  /* ── Helpers ─────────────────────────────────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'className') e.className = attrs[k];
      else if (k === 'innerHTML') e.innerHTML = attrs[k];
      else if (k === 'textContent') e.textContent = attrs[k];
      else if (k.startsWith('data-')) e.setAttribute(k, attrs[k]);
      else e[k] = attrs[k];
    });
    if (children) [].concat(children).forEach(function (c) {
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else if (c) e.appendChild(c);
    });
    return e;
  }

  function html(strings) {
    var div = document.createElement('div');
    div.innerHTML = typeof strings === 'string' ? strings : strings[0];
    return div.firstElementChild;
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function toast(msg, type) {
    var c = document.getElementById('toast-container');
    if (!c) return;
    var t = document.createElement('div');
    t.className = 'toast' + (type ? ' ' + type : '');
    var icons = { success: '✓', danger: '✗', warning: '⚠' };
    t.innerHTML = '<span>' + (icons[type] || 'ℹ') + '</span> ' + escHtml(msg);
    c.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3200);
  }

  function statusBadge(status) {
    var map = {
      completed: ['badge-success', 'Completed'],
      in_progress: ['badge-primary', 'In Progress'],
      pending: ['badge-warning', 'Pending'],
      cancelled: ['badge-danger', 'Cancelled'],
      paid: ['badge-success', 'Paid'],
      partial: ['badge-warning', 'Partial'],
      overdue: ['badge-danger', 'Overdue']
    };
    var v = map[status] || ['badge-default', status || '—'];
    return '<span class="badge ' + v[0] + '">' + escHtml(v[1]) + '</span>';
  }

  function methodLabel(m) {
    var map = { bank_transfer: 'Bank Transfer', cash: 'Cash', card: 'Card', cheque: 'Cheque', other: 'Other' };
    return map[m] || m || '—';
  }

  function getProfileName(id) {
    var p = DB.getProfileById(id);
    return p ? p.name : '—';
  }

  function getProfileInitials(id) {
    var p = DB.getProfileById(id);
    return p ? p.initials : '?';
  }

  function getActivityTitle(id) {
    var a = DB.getActivityById(id);
    return a ? a.title : '—';
  }

  /* ── Splash Screen ───────────────────────────────────────── */
  function runSplash(cb) {
    var splash = document.getElementById('splash');
    if (!splash) { cb(); return; }

    var words = [
      { word: 'Innovation', highlight: 'I' },
      { word: 'Creation',   highlight: 'C' },
      { word: 'Opportunities', highlight: 'O' }
    ];

    var wordEl   = splash.querySelector('.splash-word');
    var logoEl   = splash.querySelector('.splash-logo');
    var taglineEl= splash.querySelector('.splash-tagline');
    var step = 0;

    function showWord() {
      if (step >= words.length) {
        // hide word, show ICO logo
        wordEl.classList.remove('visible');
        setTimeout(function () {
          logoEl.classList.add('visible');
          taglineEl.classList.add('visible');
          setTimeout(function () {
            // fade out splash
            splash.style.transition = 'opacity .6s ease';
            splash.style.opacity = '0';
            setTimeout(function () {
              splash.style.display = 'none';
              cb();
            }, 600);
          }, 1200);
        }, 300);
        return;
      }
      var w = words[step];
      wordEl.innerHTML = '<span>' + escHtml(w.highlight) + '</span>' + escHtml(w.word.slice(1));
      wordEl.classList.remove('visible');
      setTimeout(function () {
        wordEl.classList.add('visible');
        setTimeout(function () {
          wordEl.classList.remove('visible');
          setTimeout(function () { step++; showWord(); }, 300);
        }, 700);
      }, 60);
    }

    showWord();
  }

  /* ── Profile Screen ──────────────────────────────────────── */
  function showProfileScreen() {
    var screen = document.getElementById('profile-screen');
    var app    = document.getElementById('app');
    screen.classList.remove('hidden');
    app.classList.add('hidden');
    renderProfileList();
  }

  function renderProfileList() {
    var profiles = DB.getProfiles();
    var list = document.getElementById('profile-list');
    if (!list) return;
    list.innerHTML = '';
    profiles.forEach(function (p) {
      var btn = document.createElement('button');
      btn.className = 'profile-btn';
      btn.innerHTML =
        '<div class="avatar">' + escHtml(p.initials || fmt.initials(p.name)) + '</div>' +
        '<div class="info"><strong>' + escHtml(p.name) + '</strong><small>' + escHtml(p.role || 'User') + '</small></div>';
      btn.addEventListener('click', function () { loginAs(p); });
      list.appendChild(btn);
    });
  }

  function loginAs(profile) {
    state.currentUser = profile;
    DB.audit('login', 'Profile', profile.id, profile.name, 'Signed in', profile.id);
    document.getElementById('profile-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    initApp();
  }

  /* ── New Profile Form ────────────────────────────────────── */
  function initProfileForm() {
    var form = document.getElementById('new-profile-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements['pname'].value.trim();
      var role = form.elements['prole'].value.trim();
      if (!name) return;
      var p = DB.createProfile({
        name: name,
        initials: fmt.initials(name),
        role: role || 'User'
      });
      form.reset();
      renderProfileList();
      toast('Profile "' + name + '" created', 'success');
    });
  }

  /* ── App Shell ───────────────────────────────────────────── */
  function initApp() {
    // set current user in sidebar
    var el = document.querySelector('.sidebar-user .uname');
    if (el) el.textContent = state.currentUser.name;
    var ri = document.querySelector('.sidebar-user .urole');
    if (ri) ri.textContent = state.currentUser.role || 'User';
    var av = document.querySelector('.sidebar-user .avatar');
    if (av) av.textContent = state.currentUser.initials || fmt.initials(state.currentUser.name);

    setupNavigation();
    navigate('dashboard');
  }

  /* ── Navigation ──────────────────────────────────────────── */
  function setupNavigation() {
    // sidebar nav items
    document.querySelectorAll('[data-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var page = btn.getAttribute('data-nav');
        navigate(page);
        closeSidebar();
      });
    });

    // hamburger
    var hamburger = document.getElementById('hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', toggleSidebar);
    }

    // sidebar close button (mobile)
    var sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener('click', closeSidebar);
    }

    // sidebar overlay
    var overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    // logout buttons
    document.querySelectorAll('[data-action="logout"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.currentUser) {
          DB.audit('logout', 'Profile', state.currentUser.id, state.currentUser.name, 'Signed out', state.currentUser.id);
        }
        state.currentUser = null;
        document.getElementById('app').classList.add('hidden');
        showProfileScreen();
      });
    });
  }

  function navigate(page) {
    state.currentPage = page;

    // update active nav
    document.querySelectorAll('[data-nav]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-nav') === page);
    });

    // update topbar title
    var titles = {
      dashboard: 'Dashboard',
      activities: 'Activities',
      payments: 'Payments',
      reports: 'Reports',
      auditlog: 'Audit Log',
      settings: 'Settings'
    };
    var titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = titles[page] || page;

    // render page
    var pages = { dashboard: renderDashboard, activities: renderActivities, payments: renderPayments, reports: renderReports, auditlog: renderAuditLog, settings: renderSettings };
    var main = document.getElementById('main-page');
    if (main && pages[page]) {
      main.innerHTML = '';
      pages[page](main);
    }
  }

  function toggleSidebar() {
    state.sidebarOpen = !state.sidebarOpen;
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open', state.sidebarOpen);
    if (overlay) overlay.classList.toggle('hidden', !state.sidebarOpen);
  }

  function closeSidebar() {
    state.sidebarOpen = false;
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.add('hidden');
  }

  /* ── DASHBOARD ───────────────────────────────────────────── */
  function renderDashboard(container) {
    var sum = DB.getSummary();
    var acts = DB.getActivities().slice().sort(function (a, b) { return b.updatedAt.localeCompare(a.updatedAt); }).slice(0, 5);
    var pays = DB.getPayments().slice().sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); }).slice(0, 4);

    container.innerHTML =
      '<div class="page-inner">' +
        '<div class="page-header">' +
          '<div><h1>Welcome back, ' + escHtml((state.currentUser || {}).name || 'User') + '</h1>' +
          '<p>Renovation project overview</p></div>' +
        '</div>' +

        /* Stat cards */
        '<div class="grid-4 mb-3" id="stat-cards">' +
          '<div class="stat-card">' +
            '<div class="stat-icon">💰</div>' +
            '<div class="stat-label">Total Spent</div>' +
            '<div class="stat-value">' + escHtml(fmt.currency(sum.totalSpent)) + '</div>' +
            '<div class="stat-sub">' + sum.paymentsCount + ' payments</div>' +
          '</div>' +
          '<div class="stat-card danger">' +
            '<div class="stat-icon">⏳</div>' +
            '<div class="stat-label">Remaining</div>' +
            '<div class="stat-value">' + escHtml(fmt.currency(sum.totalRemaining)) + '</div>' +
            '<div class="stat-sub">Outstanding balance</div>' +
          '</div>' +
          '<div class="stat-card">' +
            '<div class="stat-icon">🔨</div>' +
            '<div class="stat-label">Activities</div>' +
            '<div class="stat-value">' + sum.activitiesCount + '</div>' +
            '<div class="stat-sub">' + sum.completedCount + ' completed · ' + sum.inProgressCount + ' in progress</div>' +
          '</div>' +
          '<div class="stat-card accent">' +
            '<div class="stat-icon">💳</div>' +
            '<div class="stat-label">Pending Payments</div>' +
            '<div class="stat-value">' + escHtml(fmt.currency(sum.totalPending)) + '</div>' +
            '<div class="stat-sub">Awaiting settlement</div>' +
          '</div>' +
        '</div>' +

        /* Quick actions */
        '<div class="card mb-3">' +
          '<div class="card-header"><h2>Quick Actions</h2></div>' +
          '<div class="card-body">' +
            '<div class="quick-actions">' +
              '<div class="quick-tile" data-quick="new-activity"><div class="qt-icon">➕🔨</div><div class="qt-label">Add Activity</div></div>' +
              '<div class="quick-tile" data-quick="new-payment"><div class="qt-icon">➕💳</div><div class="qt-label">Add Payment</div></div>' +
              '<div class="quick-tile" data-quick="goto-activities"><div class="qt-icon">📋</div><div class="qt-label">All Activities</div></div>' +
              '<div class="quick-tile" data-quick="goto-payments"><div class="qt-icon">💰</div><div class="qt-label">All Payments</div></div>' +
              '<div class="quick-tile" data-quick="goto-reports"><div class="qt-icon">📊</div><div class="qt-label">Reports</div></div>' +
              '<div class="quick-tile" data-quick="goto-auditlog"><div class="qt-icon">📜</div><div class="qt-label">Audit Log</div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Recent activities */
        '<div class="grid-2">' +
          '<div class="card">' +
            '<div class="card-header"><h2>Recent Activities</h2></div>' +
            '<div class="card-body" style="padding:0">' +
              renderTimelineActivities(acts) +
            '</div>' +
            '<div class="card-footer"><button class="btn btn-ghost btn-sm btn-full" data-nav="activities">View All →</button></div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-header"><h2>Recent Payments</h2></div>' +
            '<div class="card-body" style="padding:0">' +
              renderTimelinePayments(pays) +
            '</div>' +
            '<div class="card-footer"><button class="btn btn-ghost btn-sm btn-full" data-nav="payments">View All →</button></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // quick tile handlers
    container.querySelectorAll('[data-quick]').forEach(function (tile) {
      tile.addEventListener('click', function () {
        var q = tile.getAttribute('data-quick');
        if (q === 'new-activity')     { navigate('activities'); setTimeout(function() { openActivityModal(null); }, 100); }
        else if (q === 'new-payment') { navigate('payments');   setTimeout(function() { openPaymentModal(null); }, 100); }
        else if (q === 'goto-activities') navigate('activities');
        else if (q === 'goto-payments')   navigate('payments');
        else if (q === 'goto-reports')    navigate('reports');
        else if (q === 'goto-auditlog')   navigate('auditlog');
      });
    });
    // dashboard nav item clicks (for mini nav inside dashboard)
    container.querySelectorAll('[data-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () { navigate(btn.getAttribute('data-nav')); });
    });
  }

  function renderTimelineActivities(acts) {
    if (!acts.length) return '<div class="empty-state" style="padding:1.5rem"><p>No activities yet.</p></div>';
    var dotClass = { completed: 'success', in_progress: '', pending: 'accent' };
    return '<div class="timeline" style="padding:0 1.25rem">' +
      acts.map(function (a) {
        return '<div class="timeline-item">' +
          '<div class="timeline-dot ' + (dotClass[a.status] || '') + '"></div>' +
          '<div class="timeline-content">' +
            '<div class="tl-title">' + escHtml(a.title) + '</div>' +
            '<div class="tl-meta">' + escHtml(a.category) + ' · ' + statusBadge(a.status) + ' · ' + fmt.relativeTime(a.updatedAt) + '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  function renderTimelinePayments(pays) {
    if (!pays.length) return '<div class="empty-state" style="padding:1.5rem"><p>No payments yet.</p></div>';
    return '<div class="timeline" style="padding:0 1.25rem">' +
      pays.map(function (p) {
        return '<div class="timeline-item">' +
          '<div class="timeline-dot ' + (p.status === 'paid' ? 'success' : 'accent') + '"></div>' +
          '<div class="timeline-content">' +
            '<div class="tl-title">' + escHtml(fmt.currency(p.amount)) + (p.reference ? ' · ' + escHtml(p.reference) : '') + '</div>' +
            '<div class="tl-meta">' + escHtml(getProfileName(p.paidBy)) + ' · ' + statusBadge(p.status) + ' · ' + fmt.relativeTime(p.createdAt) + '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  /* ── ACTIVITIES ──────────────────────────────────────────── */
  var actFilter = { search: '', status: '', category: '' };

  function renderActivities(container) {
    container.innerHTML =
      '<div class="page-inner">' +
        '<div class="page-header">' +
          '<div><h1>Activities</h1><p>Track all renovation tasks and work items</p></div>' +
          '<div class="page-actions">' +
            '<button class="btn btn-primary" id="btn-new-activity">＋ New Activity</button>' +
          '</div>' +
        '</div>' +

        /* Filter bar */
        '<div class="filter-bar">' +
          '<div class="search-wrap">' +
            '<span class="search-icon">🔍</span>' +
            '<input type="search" id="act-search" placeholder="Search activities…" value="' + escHtml(actFilter.search) + '">' +
          '</div>' +
          '<select id="act-status-filter">' +
            '<option value="">All Statuses</option>' +
            '<option value="pending"' + (actFilter.status==='pending'?' selected':'') + '>Pending</option>' +
            '<option value="in_progress"' + (actFilter.status==='in_progress'?' selected':'') + '>In Progress</option>' +
            '<option value="completed"' + (actFilter.status==='completed'?' selected':'') + '>Completed</option>' +
            '<option value="cancelled"' + (actFilter.status==='cancelled'?' selected':'') + '>Cancelled</option>' +
          '</select>' +
          '<select id="act-cat-filter">' +
            '<option value="">All Categories</option>' +
            ['Demolition','Electrical','Plumbing','Tiling','Flooring','Plastering','Painting','Roofing','Windows','Doors','Insulation','Other']
              .map(function(c) { return '<option value="' + escHtml(c) + '"' + (actFilter.category===c?' selected':'') + '>' + escHtml(c) + '</option>'; }).join('') +
          '</select>' +
        '</div>' +

        '<div id="activities-list"></div>' +
      '</div>';

    renderActivitiesList(container.querySelector('#activities-list'));

    container.querySelector('#btn-new-activity').addEventListener('click', function () { openActivityModal(null); });
    container.querySelector('#act-search').addEventListener('input', function (e) { actFilter.search = e.target.value; renderActivitiesList(container.querySelector('#activities-list')); });
    container.querySelector('#act-status-filter').addEventListener('change', function (e) { actFilter.status = e.target.value; renderActivitiesList(container.querySelector('#activities-list')); });
    container.querySelector('#act-cat-filter').addEventListener('change', function (e) { actFilter.category = e.target.value; renderActivitiesList(container.querySelector('#activities-list')); });
  }

  function getFilteredActivities() {
    return DB.getActivities().filter(function (a) {
      if (actFilter.search && !(a.title + ' ' + a.category + ' ' + a.contractor).toLowerCase().includes(actFilter.search.toLowerCase())) return false;
      if (actFilter.status && a.status !== actFilter.status) return false;
      if (actFilter.category && a.category !== actFilter.category) return false;
      return true;
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  function renderActivitiesList(container) {
    var acts = getFilteredActivities();
    if (!acts.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔨</div><h3>No activities found</h3><p>Adjust your filters or add a new activity.</p></div>';
      return;
    }
    container.innerHTML = '<div class="card"><div class="data-table-wrap"><table class="data-table">' +
      '<thead><tr>' +
        '<th>Date</th><th>Title</th><th>Category</th><th>Responsible</th><th>Status</th><th class="actions-col">Actions</th>' +
      '</tr></thead><tbody>' +
      acts.map(function (a) {
        return '<tr>' +
          '<td>' + escHtml(fmt.date(a.date)) + '</td>' +
          '<td><strong>' + escHtml(a.title) + '</strong>' + (a.contractor ? '<br><small class="text-muted">' + escHtml(a.contractor) + '</small>' : '') + '</td>' +
          '<td><span class="badge badge-info">' + escHtml(a.category) + '</span></td>' +
          '<td>' + escHtml(getProfileName(a.responsible)) + '</td>' +
          '<td>' + statusBadge(a.status) + '</td>' +
          '<td class="actions-col">' +
            '<button class="btn btn-outline btn-sm" data-edit-act="' + escHtml(a.id) + '">Edit</button> ' +
            '<button class="btn btn-danger btn-sm" data-del-act="' + escHtml(a.id) + '">Del</button>' +
          '</td>' +
        '</tr>';
      }).join('') +
      '</tbody></table></div></div>';

    container.querySelectorAll('[data-edit-act]').forEach(function (btn) {
      btn.addEventListener('click', function () { openActivityModal(btn.getAttribute('data-edit-act')); });
    });
    container.querySelectorAll('[data-del-act]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-del-act');
        var a = DB.getActivityById(id);
        if (a && confirm('Delete "' + a.title + '"?')) {
          DB.deleteActivity(id, (state.currentUser || {}).id);
          renderActivitiesList(container);
          toast('Activity deleted', 'danger');
        }
      });
    });
  }

  /* ── Activity Modal ──────────────────────────────────────── */
  function openActivityModal(id) {
    var editing = id ? DB.getActivityById(id) : null;
    var profiles = DB.getProfiles();
    var categories = ['Demolition','Electrical','Plumbing','Tiling','Flooring','Plastering','Painting','Roofing','Windows','Doors','Insulation','Other'];

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="' + (editing ? 'Edit' : 'New') + ' Activity">' +
        '<div class="modal-header">' +
          '<h2>' + (editing ? 'Edit Activity' : 'New Activity') + '</h2>' +
          '<button class="btn btn-ghost btn-icon" id="modal-close" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<form id="activity-form">' +
            '<div class="form-grid">' +
              '<div class="form-group">' +
                '<label for="act-title">Title <span style="color:var(--ico-danger)">*</span></label>' +
                '<input class="form-control" id="act-title" name="title" required value="' + escHtml((editing||{}).title||'') + '" placeholder="e.g. Kitchen Demolition">' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="act-date">Date <span style="color:var(--ico-danger)">*</span></label>' +
                '<input class="form-control" id="act-date" name="date" type="date" required value="' + escHtml((editing||{}).date||ICO.today()) + '">' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="act-category">Category</label>' +
                '<select class="form-control" id="act-category" name="category">' +
                  categories.map(function(c){ return '<option value="'+escHtml(c)+'"'+(((editing||{}).category||'')==c?' selected':'')+'>'+escHtml(c)+'</option>'; }).join('') +
                '</select>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="act-status">Status</label>' +
                '<select class="form-control" id="act-status" name="status">' +
                  [['pending','Pending'],['in_progress','In Progress'],['completed','Completed'],['cancelled','Cancelled']]
                    .map(function(s){ return '<option value="'+s[0]+'"'+(((editing||{}).status||'pending')===s[0]?' selected':'')+'>'+s[1]+'</option>'; }).join('') +
                '</select>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="act-responsible">Responsible</label>' +
                '<select class="form-control" id="act-responsible" name="responsible">' +
                  '<option value="">— Select —</option>' +
                  profiles.map(function(p){ return '<option value="'+escHtml(p.id)+'"'+(((editing||{}).responsible||'')==p.id?' selected':'')+'>'+escHtml(p.name)+'</option>'; }).join('') +
                '</select>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="act-contractor">Contractor / Supplier</label>' +
                '<input class="form-control" id="act-contractor" name="contractor" value="' + escHtml((editing||{}).contractor||'') + '" placeholder="Company or person name">' +
              '</div>' +
              '<div class="form-group full">' +
                '<label for="act-description">Description</label>' +
                '<textarea class="form-control" id="act-description" name="description" rows="3">' + escHtml((editing||{}).description||'') + '</textarea>' +
              '</div>' +
              '<div class="form-group full">' +
                '<label for="act-notes">Notes</label>' +
                '<textarea class="form-control" id="act-notes" name="notes" rows="2">' + escHtml((editing||{}).notes||'') + '</textarea>' +
              '</div>' +
            '</div>' +
          '</form>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" id="modal-cancel">Cancel</button>' +
          '<button class="btn btn-primary" id="modal-save">' + (editing ? 'Save Changes' : 'Create Activity') + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    function closeModal() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.querySelector('#modal-close').addEventListener('click', closeModal);
    overlay.querySelector('#modal-cancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

    overlay.querySelector('#modal-save').addEventListener('click', function () {
      var form = overlay.querySelector('#activity-form');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {
        title: form.elements['title'].value.trim(),
        date: form.elements['date'].value,
        category: form.elements['category'].value,
        status: form.elements['status'].value,
        responsible: form.elements['responsible'].value,
        contractor: form.elements['contractor'].value.trim(),
        description: form.elements['description'].value.trim(),
        notes: form.elements['notes'].value.trim()
      };
      if (editing) {
        DB.updateActivity(id, data, (state.currentUser||{}).id);
        toast('Activity updated', 'success');
      } else {
        DB.createActivity(data, (state.currentUser||{}).id);
        toast('Activity created', 'success');
      }
      closeModal();
      // refresh if on activities page
      var list = document.getElementById('activities-list');
      if (list) renderActivitiesList(list);
      // refresh dashboard stats
      var statCards = document.getElementById('stat-cards');
      if (statCards) { navigate('dashboard'); }
    });
  }

  /* ── PAYMENTS ────────────────────────────────────────────── */
  var payFilter = { search: '', status: '', method: '' };

  function renderPayments(container) {
    container.innerHTML =
      '<div class="page-inner">' +
        '<div class="page-header">' +
          '<div><h1>Payments</h1><p>Track all expenses and financial transactions</p></div>' +
          '<div class="page-actions">' +
            '<button class="btn btn-primary" id="btn-new-payment">＋ New Payment</button>' +
          '</div>' +
        '</div>' +

        '<div class="filter-bar">' +
          '<div class="search-wrap">' +
            '<span class="search-icon">🔍</span>' +
            '<input type="search" id="pay-search" placeholder="Search payments…" value="' + escHtml(payFilter.search) + '">' +
          '</div>' +
          '<select id="pay-status-filter">' +
            '<option value="">All Statuses</option>' +
            '<option value="paid"' + (payFilter.status==='paid'?' selected':'') + '>Paid</option>' +
            '<option value="pending"' + (payFilter.status==='pending'?' selected':'') + '>Pending</option>' +
            '<option value="partial"' + (payFilter.status==='partial'?' selected':'') + '>Partial</option>' +
            '<option value="overdue"' + (payFilter.status==='overdue'?' selected':'') + '>Overdue</option>' +
          '</select>' +
          '<select id="pay-method-filter">' +
            '<option value="">All Methods</option>' +
            ['bank_transfer','cash','card','cheque','other']
              .map(function(m){ return '<option value="'+m+'"'+(payFilter.method===m?' selected':'')+'>'+methodLabel(m)+'</option>'; }).join('') +
          '</select>' +
        '</div>' +

        '<div id="payments-list"></div>' +
      '</div>';

    renderPaymentsList(container.querySelector('#payments-list'));

    container.querySelector('#btn-new-payment').addEventListener('click', function () { openPaymentModal(null); });
    container.querySelector('#pay-search').addEventListener('input', function (e) { payFilter.search = e.target.value; renderPaymentsList(container.querySelector('#payments-list')); });
    container.querySelector('#pay-status-filter').addEventListener('change', function (e) { payFilter.status = e.target.value; renderPaymentsList(container.querySelector('#payments-list')); });
    container.querySelector('#pay-method-filter').addEventListener('change', function (e) { payFilter.method = e.target.value; renderPaymentsList(container.querySelector('#payments-list')); });
  }

  function getFilteredPayments() {
    return DB.getPayments().filter(function (p) {
      if (payFilter.search && !(getActivityTitle(p.activityId) + ' ' + p.reference + ' ' + getProfileName(p.paidBy)).toLowerCase().includes(payFilter.search.toLowerCase())) return false;
      if (payFilter.status && p.status !== payFilter.status) return false;
      if (payFilter.method && p.method !== payFilter.method) return false;
      return true;
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  function renderPaymentsList(container) {
    var pays = getFilteredPayments();
    if (!pays.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">💳</div><h3>No payments found</h3><p>Adjust your filters or add a new payment.</p></div>';
      return;
    }
    var total = pays.reduce(function (s, p) { return s + Number(p.amount); }, 0);
    container.innerHTML = '<div class="card">' +
      '<div class="data-table-wrap"><table class="data-table">' +
        '<thead><tr>' +
          '<th>Date</th><th>Amount</th><th>Paid By</th><th>Method</th><th>Activity</th><th>Reference</th><th>Status</th><th class="actions-col">Actions</th>' +
        '</tr></thead><tbody>' +
        pays.map(function (p) {
          return '<tr>' +
            '<td>' + escHtml(fmt.date(p.date)) + '</td>' +
            '<td><strong>' + escHtml(fmt.currency(p.amount)) + '</strong>' + (p.remaining > 0 ? '<br><small class="text-danger">Rem: ' + escHtml(fmt.currency(p.remaining)) + '</small>' : '') + '</td>' +
            '<td>' + escHtml(getProfileName(p.paidBy)) + '</td>' +
            '<td><span class="badge badge-default">' + escHtml(methodLabel(p.method)) + '</span></td>' +
            '<td>' + (p.activityId ? escHtml(getActivityTitle(p.activityId)) : '<span class="text-muted">—</span>') + '</td>' +
            '<td>' + (p.reference ? escHtml(p.reference) : '<span class="text-muted">—</span>') + '</td>' +
            '<td>' + statusBadge(p.status) + '</td>' +
            '<td class="actions-col">' +
              '<button class="btn btn-outline btn-sm" data-edit-pay="' + escHtml(p.id) + '">Edit</button> ' +
              '<button class="btn btn-danger btn-sm" data-del-pay="' + escHtml(p.id) + '">Del</button>' +
            '</td>' +
          '</tr>';
        }).join('') +
        '</tbody></table></div>' +
        '<div class="card-footer" style="text-align:right"><strong>Total: ' + escHtml(fmt.currency(total)) + '</strong> across ' + pays.length + ' payment(s)</div>' +
      '</div>';

    container.querySelectorAll('[data-edit-pay]').forEach(function (btn) {
      btn.addEventListener('click', function () { openPaymentModal(btn.getAttribute('data-edit-pay')); });
    });
    container.querySelectorAll('[data-del-pay]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-del-pay');
        if (confirm('Delete this payment?')) {
          DB.deletePayment(id, (state.currentUser||{}).id);
          renderPaymentsList(container);
          toast('Payment deleted', 'danger');
        }
      });
    });
  }

  /* ── Payment Modal ───────────────────────────────────────── */
  function openPaymentModal(id) {
    var editing = id ? DB.getPaymentById(id) : null;
    var profiles = DB.getProfiles();
    var activities = DB.getActivities();

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="' + (editing ? 'Edit' : 'New') + ' Payment">' +
        '<div class="modal-header">' +
          '<h2>' + (editing ? 'Edit Payment' : 'New Payment') + '</h2>' +
          '<button class="btn btn-ghost btn-icon" id="modal-close" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<form id="payment-form">' +
            '<div class="form-grid">' +
              '<div class="form-group">' +
                '<label for="pay-date">Payment Date <span style="color:var(--ico-danger)">*</span></label>' +
                '<input class="form-control" id="pay-date" name="date" type="date" required value="' + escHtml((editing||{}).date||ICO.today()) + '">' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="pay-amount">Amount (£) <span style="color:var(--ico-danger)">*</span></label>' +
                '<input class="form-control" id="pay-amount" name="amount" type="number" min="0" step="0.01" required value="' + escHtml((editing||{}).amount||'') + '" placeholder="0.00">' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="pay-paidby">Paid By</label>' +
                '<select class="form-control" id="pay-paidby" name="paidBy">' +
                  '<option value="">— Select —</option>' +
                  profiles.map(function(p){ return '<option value="'+escHtml(p.id)+'"'+(((editing||{}).paidBy||'')==p.id?' selected':'')+'>'+escHtml(p.name)+'</option>'; }).join('') +
                '</select>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="pay-method">Payment Method</label>' +
                '<select class="form-control" id="pay-method" name="method">' +
                  [['bank_transfer','Bank Transfer'],['cash','Cash'],['card','Card'],['cheque','Cheque'],['other','Other']]
                    .map(function(m){ return '<option value="'+m[0]+'"'+(((editing||{}).method||'bank_transfer')===m[0]?' selected':'')+'>'+m[1]+'</option>'; }).join('') +
                '</select>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="pay-status">Status</label>' +
                '<select class="form-control" id="pay-status" name="status">' +
                  [['paid','Paid'],['pending','Pending'],['partial','Partial'],['overdue','Overdue']]
                    .map(function(s){ return '<option value="'+s[0]+'"'+(((editing||{}).status||'paid')===s[0]?' selected':'')+'>'+s[1]+'</option>'; }).join('') +
                '</select>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="pay-remaining">Remaining (£)</label>' +
                '<input class="form-control" id="pay-remaining" name="remaining" type="number" min="0" step="0.01" value="' + escHtml((editing||{}).remaining||'0') + '">' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="pay-activity">Linked Activity</label>' +
                '<select class="form-control" id="pay-activity" name="activityId">' +
                  '<option value="">— None —</option>' +
                  activities.map(function(a){ return '<option value="'+escHtml(a.id)+'"'+(((editing||{}).activityId||'')==a.id?' selected':'')+'>'+escHtml(a.title)+'</option>'; }).join('') +
                '</select>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="pay-ref">Reference / Invoice #</label>' +
                '<input class="form-control" id="pay-ref" name="reference" value="' + escHtml((editing||{}).reference||'') + '" placeholder="INV-2025-001">' +
              '</div>' +
              '<div class="form-group full">' +
                '<label for="pay-notes">Notes</label>' +
                '<textarea class="form-control" id="pay-notes" name="notes" rows="2">' + escHtml((editing||{}).notes||'') + '</textarea>' +
              '</div>' +
            '</div>' +
          '</form>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" id="modal-cancel">Cancel</button>' +
          '<button class="btn btn-primary" id="modal-save">' + (editing ? 'Save Changes' : 'Record Payment') + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    function closeModal() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.querySelector('#modal-close').addEventListener('click', closeModal);
    overlay.querySelector('#modal-cancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

    overlay.querySelector('#modal-save').addEventListener('click', function () {
      var form = overlay.querySelector('#payment-form');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {
        date: form.elements['date'].value,
        amount: parseFloat(form.elements['amount'].value) || 0,
        paidBy: form.elements['paidBy'].value,
        method: form.elements['method'].value,
        status: form.elements['status'].value,
        remaining: parseFloat(form.elements['remaining'].value) || 0,
        activityId: form.elements['activityId'].value,
        reference: form.elements['reference'].value.trim(),
        notes: form.elements['notes'].value.trim()
      };
      if (editing) {
        DB.updatePayment(id, data, (state.currentUser||{}).id);
        toast('Payment updated', 'success');
      } else {
        DB.createPayment(data, (state.currentUser||{}).id);
        toast('Payment recorded', 'success');
      }
      closeModal();
      var list = document.getElementById('payments-list');
      if (list) renderPaymentsList(list);
    });
  }

  /* ── REPORTS ─────────────────────────────────────────────── */
  var reportFilter = { dateFrom: '', dateTo: '', category: '', payer: '', method: '', status: '', activityId: '', search: '' };

  function getFilteredReportPayments() {
    return DB.getPayments().filter(function (p) {
      if (reportFilter.dateFrom && p.date < reportFilter.dateFrom) return false;
      if (reportFilter.dateTo   && p.date > reportFilter.dateTo)   return false;
      if (reportFilter.category) {
        var act = p.activityId ? DB.getActivityById(p.activityId) : null;
        if (!act || act.category !== reportFilter.category) return false;
      }
      if (reportFilter.payer    && p.paidBy     !== reportFilter.payer)    return false;
      if (reportFilter.method   && p.method     !== reportFilter.method)   return false;
      if (reportFilter.status   && p.status     !== reportFilter.status)   return false;
      if (reportFilter.activityId && p.activityId !== reportFilter.activityId) return false;
      if (reportFilter.search) {
        var haystack = (getActivityTitle(p.activityId) + ' ' + (p.reference || '') + ' ' + getProfileName(p.paidBy) + ' ' + (p.notes || '')).toLowerCase();
        if (!haystack.includes(reportFilter.search.toLowerCase())) return false;
      }
      return true;
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  function renderReports(container) {
    var acts  = DB.getActivities();
    var profs = DB.getProfiles();
    var categories = ['Demolition','Electrical','Plumbing','Tiling','Flooring','Plastering','Painting','Roofing','Windows','Doors','Insulation','Other'];

    container.innerHTML =
      '<div class="page-inner">' +
        '<div class="page-header">' +
          '<div><h1>Reports</h1><p>Financial summaries and project breakdowns</p></div>' +
          '<div class="page-actions">' +
            '<button class="btn btn-ghost btn-sm" id="btn-print">🖨 Print</button>' +
          '</div>' +
        '</div>' +

        /* Filter bar */
        '<div class="filter-bar filter-bar-wrap">' +
          '<div class="search-wrap">' +
            '<span class="search-icon">🔍</span>' +
            '<input type="search" id="rep-search" placeholder="Search payments…" value="' + escHtml(reportFilter.search) + '">' +
          '</div>' +
          '<input type="date" id="rep-date-from" class="filter-date" title="From date" value="' + escHtml(reportFilter.dateFrom) + '">' +
          '<input type="date" id="rep-date-to"   class="filter-date" title="To date"   value="' + escHtml(reportFilter.dateTo) + '">' +
          '<select id="rep-cat-filter">' +
            '<option value="">All Categories</option>' +
            categories.map(function(c){ return '<option value="'+escHtml(c)+'"'+(reportFilter.category===c?' selected':'')+'>'+escHtml(c)+'</option>'; }).join('') +
          '</select>' +
          '<select id="rep-payer-filter">' +
            '<option value="">All Payers</option>' +
            profs.map(function(p){ return '<option value="'+escHtml(p.id)+'"'+(reportFilter.payer===p.id?' selected':'')+'>'+escHtml(p.name)+'</option>'; }).join('') +
          '</select>' +
          '<select id="rep-method-filter">' +
            '<option value="">All Methods</option>' +
            ['bank_transfer','cash','card','cheque','other']
              .map(function(m){ return '<option value="'+m+'"'+(reportFilter.method===m?' selected':'')+'>'+methodLabel(m)+'</option>'; }).join('') +
          '</select>' +
          '<select id="rep-status-filter">' +
            '<option value="">All Statuses</option>' +
            '<option value="paid"'+(reportFilter.status==='paid'?' selected':'')+'>Paid</option>' +
            '<option value="pending"'+(reportFilter.status==='pending'?' selected':'')+'>Pending</option>' +
            '<option value="partial"'+(reportFilter.status==='partial'?' selected':'')+'>Partial</option>' +
            '<option value="overdue"'+(reportFilter.status==='overdue'?' selected':'')+'>Overdue</option>' +
          '</select>' +
          '<select id="rep-act-filter">' +
            '<option value="">All Activities</option>' +
            acts.map(function(a){ return '<option value="'+escHtml(a.id)+'"'+(reportFilter.activityId===a.id?' selected':'')+'>'+escHtml(a.title)+'</option>'; }).join('') +
          '</select>' +
          '<button class="btn btn-ghost btn-sm" id="rep-reset-filters">Reset</button>' +
        '</div>' +

        '<div id="report-content"></div>' +
      '</div>';

    function rebuildReportContent() {
      var pays = getFilteredReportPayments();
      var totalSpent     = pays.filter(function(p){ return p.status === 'paid'; }).reduce(function(s,p){ return s + Number(p.amount); }, 0);
      var totalRemaining = pays.reduce(function(s,p){ return s + Number(p.remaining||0); }, 0);
      var totalPending   = pays.filter(function(p){ return p.status === 'pending'; }).reduce(function(s,p){ return s + Number(p.amount); }, 0);

      // Spend by payer (filtered)
      var byPayer = {};
      var allProfs = DB.getProfiles();
      allProfs.forEach(function(p){ byPayer[p.id] = { name: p.name, paid: 0, count: 0 }; });
      pays.forEach(function(p) {
        if (!byPayer[p.paidBy]) byPayer[p.paidBy] = { name: getProfileName(p.paidBy), paid: 0, count: 0 };
        byPayer[p.paidBy].paid  += Number(p.amount);
        byPayer[p.paidBy].count++;
      });
      var payerEntries = Object.values(byPayer).filter(function(e){ return e.count > 0; }).sort(function(a,b){ return b.paid-a.paid; });
      var totalAll = pays.reduce(function(s,p){ return s+Number(p.amount); }, 0);

      // Spend by category (filtered)
      var byCat = {};
      pays.forEach(function(p){
        var cat = p.activityId ? ((DB.getActivityById(p.activityId)||{}).category || 'Uncategorised') : 'Uncategorised';
        if (!byCat[cat]) byCat[cat] = 0;
        byCat[cat] += Number(p.amount);
      });
      var catEntries = Object.entries(byCat).sort(function(a,b){ return b[1]-a[1]; });
      var maxCat = catEntries.length ? catEntries[0][1] : 1;

      // Payment by method (filtered)
      var byMethod = {};
      pays.forEach(function(p){
        if (!byMethod[p.method]) byMethod[p.method] = 0;
        byMethod[p.method] += Number(p.amount);
      });
      var methodEntries = Object.entries(byMethod).sort(function(a,b){ return b[1]-a[1]; });

      // Group payments by date
      var grouped = {};
      pays.forEach(function(p){
        if (!grouped[p.date]) grouped[p.date] = [];
        grouped[p.date].push(p);
      });
      var groupedDates = Object.keys(grouped).sort(function(a,b){ return b.localeCompare(a); });

      var content = document.getElementById('report-content');
      if (!content) return;

      content.innerHTML =
        /* Summary cards */
        '<div class="report-summary-grid">' +
          '<div class="stat-card">' +
            '<div class="stat-label">Total Spent</div>' +
            '<div class="stat-value">' + escHtml(fmt.currency(totalSpent)) + '</div>' +
            '<div class="stat-sub">' + pays.filter(function(p){ return p.status==='paid'; }).length + ' paid payments</div>' +
          '</div>' +
          '<div class="stat-card danger">' +
            '<div class="stat-label">Total Remaining</div>' +
            '<div class="stat-value">' + escHtml(fmt.currency(totalRemaining)) + '</div>' +
            '<div class="stat-sub">Outstanding balance</div>' +
          '</div>' +
          '<div class="stat-card accent">' +
            '<div class="stat-label">Pending Amount</div>' +
            '<div class="stat-value">' + escHtml(fmt.currency(totalPending)) + '</div>' +
            '<div class="stat-sub">Awaiting settlement</div>' +
          '</div>' +
          '<div class="stat-card">' +
            '<div class="stat-label">Matched Records</div>' +
            '<div class="stat-value">' + pays.length + '</div>' +
            '<div class="stat-sub">of ' + DB.getPayments().length + ' total payments</div>' +
          '</div>' +
        '</div>' +

        (pays.length === 0 ? '<div class="empty-state"><div class="empty-icon">📊</div><h3>No payments match your filters</h3><p>Try adjusting or resetting the filters.</p></div>' :

        /* Breakdowns */
        '<div class="grid-2 mb-3">' +
          '<div class="card">' +
            '<div class="card-header"><h2>Spend by Payer</h2></div>' +
            '<div class="card-body">' +
              (payerEntries.length === 0 ? '<p class="text-muted">No data.</p>' :
                payerEntries.map(function(pe){
                  var pct = totalAll > 0 ? Math.round(pe.paid/totalAll*100) : 0;
                  return '<div class="report-bar-wrap">' +
                    '<div class="report-row" style="padding:.2rem 0">' +
                      '<span class="label">' + escHtml(pe.name) + '</span>' +
                      '<span class="value">' + escHtml(fmt.currency(pe.paid)) + ' <small class="text-muted">(' + pct + '%)</small></span>' +
                    '</div>' +
                    '<div class="report-bar-outer"><div class="report-bar-inner" style="width:'+pct+'%"></div></div>' +
                  '</div>';
                }).join('')) +
            '</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-header"><h2>Spend by Category</h2></div>' +
            '<div class="card-body">' +
              (catEntries.length === 0 ? '<p class="text-muted">No data.</p>' :
                catEntries.map(function(ce){
                  var pct = Math.round(ce[1]/maxCat*100);
                  return '<div class="report-bar-wrap">' +
                    '<div class="report-row" style="padding:.2rem 0">' +
                      '<span class="label">' + escHtml(ce[0]) + '</span>' +
                      '<span class="value">' + escHtml(fmt.currency(ce[1])) + '</span>' +
                    '</div>' +
                    '<div class="report-bar-outer"><div class="report-bar-inner accent" style="width:'+pct+'%"></div></div>' +
                  '</div>';
                }).join('')) +
            '</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-header"><h2>Payment Methods</h2></div>' +
            '<div class="card-body">' +
              (methodEntries.length === 0 ? '<p class="text-muted">No data.</p>' :
                methodEntries.map(function(me){
                  var pct = totalAll > 0 ? Math.round(me[1]/totalAll*100) : 0;
                  return '<div class="report-row">' +
                    '<span class="label">' + escHtml(methodLabel(me[0])) + '</span>' +
                    '<span class="value">' + escHtml(fmt.currency(me[1])) + ' <small class="text-muted">(' + pct + '%)</small></span>' +
                  '</div>';
                }).join('')) +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Grouped by date */
        '<div class="card mb-3">' +
          '<div class="card-header"><h2>Payments by Date</h2></div>' +
          groupedDates.map(function(date){
            var group = grouped[date];
            var groupTotal = group.reduce(function(s,p){ return s+Number(p.amount); }, 0);
            return '<div class="report-date-group">' +
              '<div class="report-date-header">' +
                '<span>' + escHtml(fmt.date(date)) + '</span>' +
                '<span class="report-date-total">' + escHtml(fmt.currency(groupTotal)) + '</span>' +
              '</div>' +
              '<div class="data-table-wrap"><table class="data-table">' +
                '<tbody>' +
                group.map(function(p){
                  return '<tr class="report-detail-row" data-pay-id="' + escHtml(p.id) + '">' +
                    '<td><strong>' + escHtml(fmt.currency(p.amount)) + '</strong>' + (p.remaining > 0 ? '<br><small class="text-danger">Rem: '+escHtml(fmt.currency(p.remaining))+'</small>' : '') + '</td>' +
                    '<td>' + escHtml(getProfileName(p.paidBy)) + '</td>' +
                    '<td><span class="badge badge-default">' + escHtml(methodLabel(p.method)) + '</span></td>' +
                    '<td>' + (p.activityId ? escHtml(getActivityTitle(p.activityId)) : '<span class="text-muted">—</span>') + '</td>' +
                    '<td>' + (p.reference ? escHtml(p.reference) : '<span class="text-muted">—</span>') + '</td>' +
                    '<td>' + statusBadge(p.status) + '</td>' +
                    '<td class="actions-col"><button class="btn btn-outline btn-sm" data-report-detail="' + escHtml(p.id) + '">Details</button></td>' +
                  '</tr>';
                }).join('') +
                '</tbody></table></div>' +
            '</div>';
          }).join('') +
        '</div>');

      /* Drill-down detail modal */
      content.querySelectorAll('[data-report-detail]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var payId = btn.getAttribute('data-report-detail');
          var p = DB.getPaymentById(payId);
          if (!p) return;
          openPaymentDetailModal(p);
        });
      });
    }

    rebuildReportContent();

    /* Wire up filters */
    var filterIds = ['rep-search','rep-date-from','rep-date-to','rep-cat-filter','rep-payer-filter','rep-method-filter','rep-status-filter','rep-act-filter'];
    var filterKeys = ['search','dateFrom','dateTo','category','payer','method','status','activityId'];
    filterIds.forEach(function(fid, i) {
      var el = container.querySelector('#' + fid);
      if (!el) return;
      el.addEventListener('input', function(e) { reportFilter[filterKeys[i]] = e.target.value; rebuildReportContent(); });
      el.addEventListener('change', function(e) { reportFilter[filterKeys[i]] = e.target.value; rebuildReportContent(); });
    });
    container.querySelector('#rep-reset-filters').addEventListener('click', function() {
      reportFilter = { dateFrom:'', dateTo:'', category:'', payer:'', method:'', status:'', activityId:'', search:'' };
      navigate('reports');
    });
    container.querySelector('#btn-print').addEventListener('click', function() { window.print(); });
  }

  function openPaymentDetailModal(p) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="Payment Details">' +
        '<div class="modal-header">' +
          '<h2>Payment Details</h2>' +
          '<button class="btn btn-ghost btn-icon" id="detail-close" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<dl class="detail-grid">' +
            '<dt>Amount</dt><dd><strong>' + escHtml(fmt.currency(p.amount)) + '</strong></dd>' +
            '<dt>Date</dt><dd>' + escHtml(fmt.date(p.date)) + '</dd>' +
            '<dt>Status</dt><dd>' + statusBadge(p.status) + '</dd>' +
            '<dt>Paid By</dt><dd>' + escHtml(getProfileName(p.paidBy)) + '</dd>' +
            '<dt>Method</dt><dd>' + escHtml(methodLabel(p.method)) + '</dd>' +
            '<dt>Activity</dt><dd>' + (p.activityId ? escHtml(getActivityTitle(p.activityId)) : '<span class="text-muted">—</span>') + '</dd>' +
            '<dt>Reference</dt><dd>' + (p.reference ? escHtml(p.reference) : '<span class="text-muted">—</span>') + '</dd>' +
            '<dt>Remaining</dt><dd>' + escHtml(fmt.currency(p.remaining||0)) + '</dd>' +
            (p.notes ? '<dt>Notes</dt><dd>' + escHtml(p.notes) + '</dd>' : '') +
            '<dt>Created</dt><dd>' + escHtml(fmt.datetime(p.createdAt)) + '</dd>' +
            '<dt>Updated</dt><dd>' + escHtml(fmt.datetime(p.updatedAt)) + '</dd>' +
          '</dl>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" id="detail-done">Close</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.querySelector('#detail-close').addEventListener('click', close);
    overlay.querySelector('#detail-done').addEventListener('click', close);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
  }

  /* ── AUDIT LOG ───────────────────────────────────────────── */
  var auditFilter = { dateFrom: '', dateTo: '', userId: '', action: '', entity: '' };

  function renderAuditLog(container) {
    var profs = DB.getProfiles();
    container.innerHTML =
      '<div class="page-inner">' +
        '<div class="page-header">' +
          '<div><h1>Audit Log</h1><p>Complete history of all changes</p></div>' +
          '<div class="page-actions">' +
            '<button class="btn btn-danger btn-sm" id="btn-clear-log">Clear Log</button>' +
          '</div>' +
        '</div>' +

        /* Filter bar */
        '<div class="filter-bar">' +
          '<input type="date" id="aud-date-from" class="filter-date" title="From date" value="' + escHtml(auditFilter.dateFrom) + '">' +
          '<input type="date" id="aud-date-to"   class="filter-date" title="To date"   value="' + escHtml(auditFilter.dateTo) + '">' +
          '<select id="aud-user-filter">' +
            '<option value="">All Users</option>' +
            profs.map(function(p){ return '<option value="'+escHtml(p.id)+'"'+(auditFilter.userId===p.id?' selected':'')+'>'+escHtml(p.name)+'</option>'; }).join('') +
          '</select>' +
          '<select id="aud-action-filter">' +
            '<option value="">All Actions</option>' +
            ['create','update','delete','login','logout']
              .map(function(a){ return '<option value="'+a+'"'+(auditFilter.action===a?' selected':'')+'>'+a.charAt(0).toUpperCase()+a.slice(1)+'</option>'; }).join('') +
          '</select>' +
          '<select id="aud-entity-filter">' +
            '<option value="">All Entities</option>' +
            ['Activity','Payment','Profile']
              .map(function(e){ return '<option value="'+e+'"'+(auditFilter.entity===e?' selected':'')+'>'+e+'</option>'; }).join('') +
          '</select>' +
          '<button class="btn btn-ghost btn-sm" id="aud-reset-filters">Reset</button>' +
        '</div>' +

        '<div id="audit-log-content"></div>' +
      '</div>';

    renderAuditLogContent(container.querySelector('#audit-log-content'));

    container.querySelector('#btn-clear-log').addEventListener('click', function () {
      if (confirm('Clear the entire audit log? This cannot be undone.')) {
        DB.clearAuditLog();
        renderAuditLogContent(container.querySelector('#audit-log-content'));
        toast('Audit log cleared', 'warning');
      }
    });

    ['aud-date-from','aud-date-to','aud-user-filter','aud-action-filter','aud-entity-filter'].forEach(function(fid) {
      var filterKeyMap = { 'aud-date-from':'dateFrom','aud-date-to':'dateTo','aud-user-filter':'userId','aud-action-filter':'action','aud-entity-filter':'entity' };
      var el = container.querySelector('#' + fid);
      if (!el) return;
      el.addEventListener('change', function(e) {
        auditFilter[filterKeyMap[fid]] = e.target.value;
        renderAuditLogContent(container.querySelector('#audit-log-content'));
      });
    });
    container.querySelector('#aud-reset-filters').addEventListener('click', function() {
      auditFilter = { dateFrom:'', dateTo:'', userId:'', action:'', entity:'' };
      navigate('auditlog');
    });
  }

  function renderAuditLogContent(container) {
    var log = DB.getAuditLog().filter(function(entry) {
      var entryDate = entry.ts.slice(0, 10);
      if (auditFilter.dateFrom && entryDate < auditFilter.dateFrom) return false;
      if (auditFilter.dateTo   && entryDate > auditFilter.dateTo)   return false;
      if (auditFilter.userId   && entry.userId !== auditFilter.userId)   return false;
      if (auditFilter.action   && entry.action  !== auditFilter.action)  return false;
      if (auditFilter.entity   && entry.entity  !== auditFilter.entity)  return false;
      return true;
    });

    if (!log.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📜</div><h3>No audit entries found</h3><p>Actions like creating or editing records will appear here.</p></div>';
      return;
    }

    var actionIcons  = { create: '✨', update: '✏️', delete: '🗑️', login: '🔑', logout: '🚪' };
    var actionColors = { create: 'success', update: '', delete: 'danger', login: 'primary', logout: '' };

    container.innerHTML =
      '<div class="card">' +
        '<div class="card-body" style="padding:0 1.25rem">' +
          '<div class="audit-log">' +
            log.map(function (entry) {
              var icon = actionIcons[entry.action] || 'ℹ️';
              var hasSnapshots = entry.prevSnapshot || entry.newSnapshot;
              return '<div class="audit-entry">' +
                '<div class="audit-icon">' + icon + '</div>' +
                '<div class="audit-body">' +
                  '<div class="audit-action">' +
                    '<span class="badge ' + ('badge-' + (actionColors[entry.action] || 'default')) + '" style="font-size:.7rem;margin-right:.35rem">' + escHtml(entry.action.toUpperCase()) + '</span>' +
                    escHtml(entry.entity) + ': ' + escHtml(entry.entityName || entry.entityId) +
                  '</div>' +
                  '<div class="audit-detail">' + escHtml(entry.detail) + (entry.userId ? ' · by ' + escHtml(getProfileName(entry.userId)) : '') + '</div>' +
                '</div>' +
                '<div class="audit-time">' +
                  escHtml(fmt.datetime(entry.ts)) +
                  (hasSnapshots ? '<br><button class="btn btn-ghost btn-sm audit-detail-btn" data-audit-id="' + escHtml(entry.id) + '" style="margin-top:.3rem;font-size:.75rem">View Changes</button>' : '') +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>';

    container.querySelectorAll('.audit-detail-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var entryId = btn.getAttribute('data-audit-id');
        var entry = DB.getAuditLog().find(function(e){ return e.id === entryId; });
        if (entry) openAuditDetailModal(entry);
      });
    });
  }

  function openAuditDetailModal(entry) {
    function snapshotToHtml(snapshot) {
      if (!snapshot) return '<em class="text-muted">—</em>';
      var keys = Object.keys(snapshot);
      return '<dl class="detail-grid">' +
        keys.map(function(k) {
          var v = snapshot[k];
          if (v === null || v === undefined || v === '') return '';
          return '<dt>' + escHtml(k) + '</dt><dd>' + escHtml(String(v)) + '</dd>';
        }).filter(Boolean).join('') +
        '</dl>';
    }

    function diffHtml(prev, next) {
      if (!prev || !next) return '';
      var keys = Object.keys(Object.assign({}, prev, next));
      var diffs = keys.filter(function(k) { return String(prev[k]||'') !== String(next[k]||''); });
      if (!diffs.length) return '<p class="text-muted" style="font-size:.85rem">No field differences detected.</p>';
      return '<table class="data-table" style="font-size:.83rem"><thead><tr><th>Field</th><th>Before</th><th>After</th></tr></thead><tbody>' +
        diffs.map(function(k){
          return '<tr>' +
            '<td><strong>' + escHtml(k) + '</strong></td>' +
            '<td class="text-danger">' + escHtml(String(prev[k]||'—')) + '</td>' +
            '<td class="text-success">' + escHtml(String(next[k]||'—')) + '</td>' +
          '</tr>';
        }).join('') +
      '</tbody></table>';
    }

    var hasBoth = entry.prevSnapshot && entry.newSnapshot;
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="Audit Entry Details">' +
        '<div class="modal-header">' +
          '<h2>Change Details</h2>' +
          '<button class="btn btn-ghost btn-icon" id="aud-detail-close" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="audit-meta-row">' +
            '<span class="badge badge-' + ({'create':'success','update':'','delete':'danger','login':'primary','logout':''}[entry.action]||'default') + '">' + escHtml(entry.action.toUpperCase()) + '</span>' +
            '<strong>' + escHtml(entry.entity) + ': ' + escHtml(entry.entityName || entry.entityId) + '</strong>' +
            '<span class="text-muted" style="font-size:.82rem">' + escHtml(fmt.datetime(entry.ts)) + '</span>' +
          '</div>' +
          '<p style="font-size:.88rem;margin:.75rem 0 1rem;">' + escHtml(entry.detail) + (entry.userId ? ' · <em>by ' + escHtml(getProfileName(entry.userId)) + '</em>' : '') + '</p>' +
          (hasBoth ?
            '<h3 style="font-size:.9rem;font-weight:700;margin-bottom:.5rem;">Changes</h3>' +
            diffHtml(entry.prevSnapshot, entry.newSnapshot) :
            (entry.prevSnapshot ?
              '<h3 style="font-size:.9rem;font-weight:700;margin-bottom:.5rem;">Deleted Record</h3>' + snapshotToHtml(entry.prevSnapshot) :
              entry.newSnapshot ?
              '<h3 style="font-size:.9rem;font-weight:700;margin-bottom:.5rem;">Created Record</h3>' + snapshotToHtml(entry.newSnapshot) : '')) +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" id="aud-detail-done">Close</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.querySelector('#aud-detail-close').addEventListener('click', close);
    overlay.querySelector('#aud-detail-done').addEventListener('click', close);
    overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
  }

  /* ── SETTINGS ────────────────────────────────────────────── */
  function renderSettings(container) {
    container.innerHTML =
      '<div class="page-inner">' +
        '<div class="page-header">' +
          '<div><h1>Settings</h1><p>Manage your data and app preferences</p></div>' +
        '</div>' +

        /* Data Management */
        '<div class="settings-section">' +
          '<h2 class="settings-section-title">Data Management</h2>' +
          '<div class="settings-cards">' +

            '<div class="settings-card">' +
              '<div class="settings-card-icon">📤</div>' +
              '<div class="settings-card-body">' +
                '<div class="settings-card-title">Export Data</div>' +
                '<div class="settings-card-desc">Download all your data (activities, payments, audit log) as a JSON file for backup or transfer.</div>' +
                '<button class="btn btn-outline btn-sm mt-2" id="btn-export">Export as JSON</button>' +
              '</div>' +
            '</div>' +

            '<div class="settings-card">' +
              '<div class="settings-card-icon">📥</div>' +
              '<div class="settings-card-body">' +
                '<div class="settings-card-title">Import Data</div>' +
                '<div class="settings-card-desc">Import data from a previously exported JSON file. This will <strong>overwrite</strong> the matching data.</div>' +
                '<label class="btn btn-outline btn-sm mt-2" style="cursor:pointer">' +
                  'Import from JSON<input type="file" id="import-file" accept=".json" style="display:none">' +
                '</label>' +
              '</div>' +
            '</div>' +

            '<div class="settings-card settings-card-danger">' +
              '<div class="settings-card-icon">⚠️</div>' +
              '<div class="settings-card-body">' +
                '<div class="settings-card-title">Reset App Data</div>' +
                '<div class="settings-card-desc">Remove all your data and restore the original demo data. This <strong>cannot be undone</strong>.</div>' +
                '<button class="btn btn-danger btn-sm mt-2" id="btn-reset">Reset to Demo Data</button>' +
              '</div>' +
            '</div>' +

          '</div>' +
        '</div>' +

        /* App Info */
        '<div class="settings-section">' +
          '<h2 class="settings-section-title">App Information</h2>' +
          '<div class="card">' +
            '<div class="card-body">' +
              '<dl class="detail-grid">' +
                '<dt>App Name</dt><dd><strong>ICO Renovation Reporting</strong></dd>' +
                '<dt>Version</dt><dd>' + escHtml(APP_VERSION) + ' (Phase 3)</dd>' +
                '<dt>Storage</dt><dd>Local (browser localStorage)</dd>' +
                '<dt>Activities</dt><dd>' + DB.getActivities().length + ' records</dd>' +
                '<dt>Payments</dt><dd>' + DB.getPayments().length + ' records</dd>' +
                '<dt>Audit Entries</dt><dd>' + DB.getAuditLog().length + ' entries</dd>' +
              '</dl>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Cloud Sync Placeholder */
        '<div class="settings-section">' +
          '<h2 class="settings-section-title">Cloud Sync <span class="badge badge-accent" style="vertical-align:middle">Coming Soon</span></h2>' +
          '<div class="card">' +
            '<div class="card-body">' +
              '<div class="empty-state" style="padding:1.5rem">' +
                '<div class="empty-icon">☁️</div>' +
                '<h3>Supabase Integration</h3>' +
                '<p>Cloud sync and multi-device access will be available in a future update. Your data is safely stored locally for now.</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

      '</div>';

    /* Export */
    container.querySelector('#btn-export').addEventListener('click', function() {
      var data = DB.exportAllData();
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url  = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'ico-data-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      toast('Data exported successfully', 'success');
    });

    /* Import */
    container.querySelector('#import-file').addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        try {
          var data = JSON.parse(ev.target.result);
          DB.importAllData(data);
          toast('Data imported successfully. Refreshing…', 'success');
          setTimeout(function() { navigate('dashboard'); }, 1000);
        } catch (err) {
          toast('Import failed: invalid JSON file', 'danger');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    /* Reset */
    container.querySelector('#btn-reset').addEventListener('click', function() {
      if (confirm('Reset ALL data to the original demo data? This cannot be undone.')) {
        DB.resetAllData();
        toast('App data has been reset to demo data', 'warning');
        setTimeout(function() { navigate('dashboard'); }, 800);
      }
    });
  }

  /* ── Bootstrap ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initProfileForm();

    runSplash(function () {
      showProfileScreen();
    });
  });

})();
