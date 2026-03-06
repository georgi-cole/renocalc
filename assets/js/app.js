/**
 * ICO Renovation Reporting App – Main Application
 */
(function () {
  'use strict';

  var DB  = ICO.DB;
  var fmt = ICO.fmt;

  var APP_VERSION = '3.0.0';

  /* ── Translations ─────────────────────────────────────────── */
  var TRANSLATIONS = {
    en: {
      'brand.tagline': 'Renovation Reporting',
      'splash.tagline': 'Renovation Reporting',
      'nav.section.main': 'Main',
      'nav.section.insights': 'Insights',
      'nav.section.app': 'App',
      'nav.dashboard': 'Dashboard',
      'nav.activities': 'Activities',
      'nav.reports': 'Reports',
      'nav.auditlog': 'Audit Log',
      'nav.settings': 'Settings',
      'nav.signout': 'Sign Out',
      'nav.home': 'Home',
      'nav.log': 'Log',
      'login.select': 'Select your profile to continue',
      'login.or': 'or create a new profile',
      'login.fullname': 'Full Name',
      'login.fullname.placeholder': 'Your full name',
      'login.role': 'Role',
      'login.role.placeholder': 'e.g. Project Manager',
      'login.optional': 'optional',
      'login.createbtn': 'Create Profile & Sign In',
      'dash.title': 'Dashboard',
      'dash.welcome': 'Welcome back, {name}',
      'dash.subtitle': 'Renovation project overview',
      'dash.totalspent': 'Total Paid',
      'dash.remaining': 'Remaining',
      'dash.activities': 'Activities',
      'dash.pending': 'Pending Activities',
      'dash.quickactions': 'Quick Actions',
      'dash.addactivity': 'Add Activity',
      'dash.allactivities': 'All Activities',
      'dash.reports': 'Reports',
      'dash.auditlog': 'Audit Log',
      'dash.recentactivities': 'Recent Activities',
      'dash.viewall': 'View All →',
      'dash.noactivities': 'No activities yet.',
      'dash.outstandingbalance': 'Outstanding balance',
      'dash.awaitingsettlement': 'Awaiting completion',
      'dash.completedN': '{count} completed',
      'dash.inprogressN': '{count} in progress',
      'act.title': 'Activities',
      'act.subtitle': 'Track all renovation tasks and work items',
      'act.new': '＋ New Activity',
      'act.search': 'Search activities…',
      'act.allstatuses': 'All Statuses',
      'act.allcats': 'All Categories',
      'act.col.date': 'Date',
      'act.col.title': 'Title',
      'act.col.category': 'Category',
      'act.col.status': 'Status',
      'act.col.paid': 'Paid',
      'act.col.type': 'Payment Type',
      'act.col.remaining': 'Remaining',
      'act.col.actions': 'Actions',
      'act.empty': 'No activities found',
      'act.emptysub': 'Adjust your filters or add a new activity.',
      'act.edit': 'Edit',
      'act.del': 'Del',
      'act.modal.new': 'New Activity',
      'act.modal.edit': 'Edit Activity',
      'act.modal.fieldtitle': 'Title',
      'act.modal.fielddate': 'Date',
      'act.modal.fieldcat': 'Category',
      'act.modal.fieldstatus': 'Status',
      'act.modal.fieldcontractor': 'Contractor / Supplier',
      'act.modal.fieldnotes': 'Notes',
      'act.modal.fieldamount': 'Payment Amount',
      'act.modal.fieldtype': 'Payment Type',
      'act.modal.fieldremaining': 'Due / Remaining',
      'act.modal.cancel': 'Cancel',
      'act.modal.save': 'Save Changes',
      'act.modal.create': 'Create Activity',
      'act.toast.created': 'Activity created',
      'act.toast.updated': 'Activity updated',
      'act.toast.deleted': 'Activity deleted',
      'act.confirm.delete': 'Delete "{title}"?',
      'act.detail.title': 'Activity Detail',
      'act.detail.close': 'Close',
      'act.detail.createdat': 'Created',
      'act.detail.updatedat': 'Last Updated',
      'act.modal.fieldwhopaid': 'Who Paid',
      'act.modal.fieldsupplier': 'Supplier',
      'act.modal.fieldinvoice': 'Invoice Ref',
      'act.modal.fieldcurrency': 'Currency',
      'act.form.mandatory': 'Required Fields',
      'act.form.optional': 'Additional Fields',
      'status.pending': 'Pending',
      'status.in_progress': 'In Progress',
      'status.completed': 'Completed',
      'status.cancelled': 'Cancelled',
      'method.cash': 'Cash',
      'method.bank_transfer': 'Bank Transfer',
      'method.card': 'Card',
      'method.other': 'Other',
      'cat.Demolition': 'Demolition',
      'cat.Electrical': 'Electrical',
      'cat.Plumbing': 'Plumbing',
      'cat.Tiling': 'Tiling',
      'cat.Flooring': 'Flooring',
      'cat.Plastering': 'Plastering',
      'cat.Painting': 'Painting',
      'cat.Roofing': 'Roofing',
      'cat.Windows': 'Windows',
      'cat.Doors': 'Doors',
      'cat.Insulation': 'Insulation',
      'cat.Other': 'Other',
      'rep.title': 'Reports',
      'rep.subtitle': 'Financial summaries and project breakdowns',
      'rep.print': '🖨 Print',
      'rep.search': 'Search activities…',
      'rep.allcats': 'All Categories',
      'rep.allstatuses': 'All Statuses',
      'rep.reset': 'Reset',
      'rep.totalspent': 'Total Paid',
      'rep.totalremaining': 'Total Remaining',
      'rep.pendingcount': 'Pending Activities',
      'rep.matched': 'Matched Records',
      'rep.bycategory': 'Spend by Category',
      'rep.bytype': 'Payment Methods',
      'rep.bydate': 'Activities by Date',
      'rep.nodata': 'No data.',
      'rep.empty': 'No activities match your filters',
      'rep.emptysub': 'Try adjusting or resetting the filters.',
      'rep.ofTotal': 'of {total} total activities',
      'rep.paidacts': '{count} paid activities',
      'rep.outstanding': 'Outstanding balance',
      'rep.pendingacts': 'Pending activities',
      'aud.title': 'Audit Log',
      'aud.subtitle': 'Complete history of all changes',
      'aud.clearlog': 'Clear Log',
      'aud.confirmclear': 'Clear the entire audit log? This cannot be undone.',
      'aud.cleared': 'Audit log cleared',
      'aud.allusers': 'All Users',
      'aud.allactions': 'All Actions',
      'aud.allentities': 'All Entities',
      'aud.reset': 'Reset',
      'aud.viewchanges': 'View Changes',
      'aud.changes': 'Change Details',
      'aud.empty': 'No audit entries found',
      'aud.emptysub': 'Actions like creating or editing records will appear here.',
      'set.title': 'Settings',
      'set.subtitle': 'Manage your data and app preferences',
      'set.datamgmt': 'Data Management',
      'set.export': 'Export Data',
      'set.exportdesc': 'Download all your data as a JSON file for backup or transfer.',
      'set.exportbtn': 'Export as JSON',
      'set.import': 'Import Data',
      'set.importdesc': 'Import data from a previously exported JSON file. This will overwrite the matching data.',
      'set.importbtn': 'Import from JSON',
      'set.reset': 'Reset App Data',
      'set.resetdesc': 'Remove all your data and restore the original demo data. This cannot be undone.',
      'set.resetbtn': 'Reset to Demo Data',
      'set.appinfo': 'App Information',
      'set.appname': 'ICO Renovation Reporting',
      'set.version': 'Version',
      'set.storage': 'Storage',
      'set.storageval': 'Local (browser localStorage)',
      'set.activities': 'Activities',
      'set.auditentries': 'Audit Entries',
      'set.records': 'records',
      'set.entries': 'entries',
      'set.cloudsync': 'Cloud Sync',
      'set.clouddesc': 'Cloud sync and multi-device access will be available in a future update. Your data is safely stored locally for now.',
      'set.exported': 'Data exported successfully',
      'set.imported': 'Data imported successfully. Refreshing…',
      'set.importfail': 'Import failed: invalid JSON file',
      'set.confirmreset': 'Reset ALL data to the original demo data? This cannot be undone.',
      'set.resetdone': 'App data has been reset to demo data',
      'common.close': 'Close',
      'common.select': '— Select —',
      'login.profilecreated': 'Profile "{name}" created'
    },
    bg: {
      'brand.tagline': 'Ремонтни дейности',
      'splash.tagline': 'Ремонтни дейности',
      'nav.section.main': 'Основни',
      'nav.section.insights': 'Отчети',
      'nav.section.app': 'Приложение',
      'nav.dashboard': 'Табло',
      'nav.activities': 'Дейности',
      'nav.reports': 'Отчети',
      'nav.auditlog': 'Журнал',
      'nav.settings': 'Настройки',
      'nav.signout': 'Изход',
      'nav.home': 'Начало',
      'nav.log': 'Журнал',
      'login.select': 'Изберете вашия профил за вход',
      'login.or': 'или създайте нов профил',
      'login.fullname': 'Пълно име',
      'login.fullname.placeholder': 'Вашето пълно име',
      'login.role': 'Роля',
      'login.role.placeholder': 'напр. Ръководител на проект',
      'login.optional': 'по избор',
      'login.createbtn': 'Създай профил и влез',
      'dash.title': 'Табло',
      'dash.welcome': 'Добре дошъл, {name}',
      'dash.subtitle': 'Преглед на ремонтния проект',
      'dash.totalspent': 'Платено',
      'dash.remaining': 'Остатък',
      'dash.activities': 'Дейности',
      'dash.pending': 'Предстоящи дейности',
      'dash.quickactions': 'Бързи действия',
      'dash.addactivity': 'Добави дейност',
      'dash.allactivities': 'Всички дейности',
      'dash.reports': 'Отчети',
      'dash.auditlog': 'Журнал',
      'dash.recentactivities': 'Последни дейности',
      'dash.viewall': 'Виж всички →',
      'dash.noactivities': 'Няма дейности.',
      'dash.outstandingbalance': 'Неизплатен остатък',
      'dash.awaitingsettlement': 'Предстоящо изпълнение',
      'dash.completedN': '{count} завършени',
      'dash.inprogressN': '{count} в процес',
      'act.title': 'Дейности',
      'act.subtitle': 'Проследявайте всички задачи и дейности по ремонта',
      'act.new': '＋ Нова дейност',
      'act.search': 'Търси дейности…',
      'act.allstatuses': 'Всички статуси',
      'act.allcats': 'Всички категории',
      'act.col.date': 'Дата',
      'act.col.title': 'Заглавие',
      'act.col.category': 'Категория',
      'act.col.status': 'Статус',
      'act.col.paid': 'Платена сума',
      'act.col.type': 'Вид плащане',
      'act.col.remaining': 'Остатък',
      'act.col.actions': 'Действия',
      'act.empty': 'Няма намерени дейности',
      'act.emptysub': 'Коригирайте филтрите или добавете нова дейност.',
      'act.edit': 'Редакция',
      'act.del': 'Изтрий',
      'act.modal.new': 'Нова дейност',
      'act.modal.edit': 'Редактирай дейност',
      'act.modal.fieldtitle': 'Заглавие',
      'act.modal.fielddate': 'Дата',
      'act.modal.fieldcat': 'Категория',
      'act.modal.fieldstatus': 'Статус',
      'act.modal.fieldcontractor': 'Изпълнител / Доставчик',
      'act.modal.fieldnotes': 'Бележки',
      'act.modal.fieldamount': 'Платена сума',
      'act.modal.fieldtype': 'Вид плащане',
      'act.modal.fieldremaining': 'Остатък',
      'act.modal.cancel': 'Откажи',
      'act.modal.save': 'Запиши',
      'act.modal.create': 'Създай дейност',
      'act.toast.created': 'Дейността е създадена',
      'act.toast.updated': 'Дейността е обновена',
      'act.toast.deleted': 'Дейността е изтрита',
      'act.confirm.delete': 'Изтриване на "{title}"?',
      'act.detail.title': 'Детайли за дейност',
      'act.detail.close': 'Затвори',
      'act.detail.createdat': 'Създадена',
      'act.detail.updatedat': 'Последна промяна',
      'act.modal.fieldwhopaid': 'Кой плати',
      'act.modal.fieldsupplier': 'Доставчик',
      'act.modal.fieldinvoice': 'Фактура / реф.',
      'act.modal.fieldcurrency': 'Валута',
      'act.form.mandatory': 'Задължителни полета',
      'act.form.optional': 'Допълнителни полета',
      'status.pending': 'Предстоящо',
      'status.in_progress': 'В процес',
      'status.completed': 'Завършено',
      'status.cancelled': 'Отменено',
      'method.cash': 'В брой',
      'method.bank_transfer': 'Банков превод',
      'method.card': 'Карта',
      'method.other': 'Друго',
      'cat.Demolition': 'Демонтаж',
      'cat.Electrical': 'Електро',
      'cat.Plumbing': 'ВиК',
      'cat.Tiling': 'Плочки',
      'cat.Flooring': 'Подове',
      'cat.Plastering': 'Мазилка',
      'cat.Painting': 'Боядисване',
      'cat.Roofing': 'Покрив',
      'cat.Windows': 'Прозорци',
      'cat.Doors': 'Врати',
      'cat.Insulation': 'Изолация',
      'cat.Other': 'Друго',
      'rep.title': 'Отчети',
      'rep.subtitle': 'Финансови обобщения и разбивки по проект',
      'rep.print': '🖨 Печат',
      'rep.search': 'Търси дейности…',
      'rep.allcats': 'Всички категории',
      'rep.allstatuses': 'Всички статуси',
      'rep.reset': 'Нулиране',
      'rep.totalspent': 'Платено',
      'rep.totalremaining': 'Общ остатък',
      'rep.pendingcount': 'Предстоящи дейности',
      'rep.matched': 'Намерени записи',
      'rep.bycategory': 'Платено по категория',
      'rep.bytype': 'Вид плащане',
      'rep.bydate': 'Дейности по дата',
      'rep.nodata': 'Няма данни.',
      'rep.empty': 'Няма дейности по зададените филтри',
      'rep.emptysub': 'Опитайте да нулирате филтрите.',
      'rep.ofTotal': 'от {total} общо дейности',
      'rep.paidacts': '{count} платени дейности',
      'rep.outstanding': 'Неизплатен остатък',
      'rep.pendingacts': 'Предстоящи дейности',
      'aud.title': 'Одиторски журнал',
      'aud.subtitle': 'Пълна история на всички промени',
      'aud.clearlog': 'Изчисти журнала',
      'aud.confirmclear': 'Изчистване на целия журнал? Това не може да бъде отменено.',
      'aud.cleared': 'Журналът е изчистен',
      'aud.allusers': 'Всички потребители',
      'aud.allactions': 'Всички действия',
      'aud.allentities': 'Всички обекти',
      'aud.reset': 'Нулиране',
      'aud.viewchanges': 'Виж промени',
      'aud.changes': 'Детайли на промяната',
      'aud.empty': 'Няма журнални записи',
      'aud.emptysub': 'Действия като създаване или редактиране ще се покажат тук.',
      'set.title': 'Настройки',
      'set.subtitle': 'Управлявайте данните и настройките на приложението',
      'set.datamgmt': 'Управление на данни',
      'set.export': 'Експорт на данни',
      'set.exportdesc': 'Изтеглете всички данни като JSON файл за резервно копие.',
      'set.exportbtn': 'Експорт като JSON',
      'set.import': 'Импорт на данни',
      'set.importdesc': 'Импортирайте данни от предварително експортиран JSON файл. Това ще замени съответстващите данни.',
      'set.importbtn': 'Импорт от JSON',
      'set.reset': 'Нулиране на данните',
      'set.resetdesc': 'Изтрийте всички данни и възстановете оригиналните демо данни. Това не може да бъде отменено.',
      'set.resetbtn': 'Нулиране към демо данни',
      'set.appinfo': 'Информация за приложението',
      'set.appname': 'ICO Ремонтни дейности',
      'set.version': 'Версия',
      'set.storage': 'Съхранение',
      'set.storageval': 'Локално (localStorage)',
      'set.activities': 'Дейности',
      'set.auditentries': 'Журнални записи',
      'set.records': 'записа',
      'set.entries': 'записа',
      'set.cloudsync': 'Облачна синхронизация',
      'set.clouddesc': 'Облачната синхронизация ще бъде налична в бъдеща версия. Данните ви са безопасно съхранени локално.',
      'set.exported': 'Данните са успешно експортирани',
      'set.imported': 'Данните са успешно импортирани. Зареждане…',
      'set.importfail': 'Импортът е неуспешен: невалиден JSON файл',
      'set.confirmreset': 'Нулиране на ВСИЧКИ данни към оригиналните демо данни? Това не може да бъде отменено.',
      'set.resetdone': 'Данните на приложението са нулирани към демо данните',
      'common.close': 'Затвори',
      'common.select': '— Избери —',
      'login.profilecreated': 'Профилът "{name}" е създаден'
    }
  };

  /* ── State ────────────────────────────────────────────────── */
  var state = {
    currentUser: null,
    currentPage: 'dashboard',
    sidebarOpen: false,
    lang: 'en'
  };

  /* ── Translation helper ──────────────────────────────────── */
  function t(key, params) {
    var lang = state.lang || 'en';
    var langVal = TRANSLATIONS[lang] && TRANSLATIONS[lang][key];
    var enVal   = TRANSLATIONS['en']  && TRANSLATIONS['en'][key];
    var str = (typeof langVal !== 'undefined') ? langVal
            : (typeof enVal  !== 'undefined') ? enVal
            : '';
    if (params && str) {
      Object.keys(params).forEach(function (k) {
        str = str.replace('{' + k + '}', params[k]);
      });
    }
    return str;
  }

  /* Apply data-i18n translations to elements in the DOM */
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var val = t(el.getAttribute('data-i18n-placeholder'));
      if (val) el.placeholder = val;
    });
    // Update lang buttons active state
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === state.lang);
    });
    // Update <html lang="..."> for screen readers
    if (document.documentElement) document.documentElement.lang = state.lang;
  }

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
    var classes = {
      completed: 'badge-success',
      in_progress: 'badge-primary',
      pending: 'badge-warning',
      cancelled: 'badge-danger'
    };
    var cls = classes[status] || 'badge-default';
    var label = t('status.' + status) || status || '—';
    return '<span class="badge ' + cls + '">' + escHtml(label) + '</span>';
  }

  function methodLabel(m) {
    return t('method.' + m) || m || '—';
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
    applyTranslations();
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
      DB.createProfile({
        name: name,
        initials: fmt.initials(name),
        role: role || 'User'
      });
      form.reset();
      renderProfileList();
      toast(t('login.profilecreated', { name: name }), 'success');
    });

    // Language selector buttons
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.getAttribute('data-lang');
        state.lang = lang;
        try { localStorage.setItem('ico_lang', lang); } catch (e) { /* ignore */ }
        applyTranslations();
      });
    });
  }

  /* ── App Shell ───────────────────────────────────────────── */
  function initApp() {
    // set current user in sidebar
    var uname = document.querySelector('.sidebar-user .uname');
    if (uname) uname.textContent = state.currentUser.name;
    var urole = document.querySelector('.sidebar-user .urole');
    if (urole) urole.textContent = state.currentUser.role || 'User';
    var av = document.querySelector('.sidebar-user .avatar');
    if (av) av.textContent = state.currentUser.initials || fmt.initials(state.currentUser.name);

    applyTranslations();
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
    var titleKeys = {
      dashboard: 'nav.dashboard',
      activities: 'nav.activities',
      reports: 'nav.reports',
      auditlog: 'nav.auditlog',
      settings: 'nav.settings'
    };
    var titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = t(titleKeys[page] || 'nav.' + page);

    // render page
    var pages = { dashboard: renderDashboard, activities: renderActivities, reports: renderReports, auditlog: renderAuditLog, settings: renderSettings };
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

    container.innerHTML =
      '<div class="page-inner">' +
        '<div class="page-header">' +
          '<div><h1>' + escHtml(t('dash.welcome', { name: (state.currentUser || {}).name || 'User' })) + '</h1>' +
          '<p>' + escHtml(t('dash.subtitle')) + '</p></div>' +
        '</div>' +

        /* Stat cards */
        '<div class="grid-4 mb-3" id="stat-cards">' +
          '<div class="stat-card">' +
            '<div class="stat-icon">💰</div>' +
            '<div class="stat-label">' + escHtml(t('dash.totalspent')) + '</div>' +
            '<div class="stat-value">' + escHtml(fmt.currency(sum.totalSpent)) + '</div>' +
            '<div class="stat-sub">' + escHtml(t('dash.completedN', { count: sum.completedCount })) + '</div>' +
          '</div>' +
          '<div class="stat-card danger">' +
            '<div class="stat-icon">⏳</div>' +
            '<div class="stat-label">' + escHtml(t('dash.remaining')) + '</div>' +
            '<div class="stat-value">' + escHtml(fmt.currency(sum.totalRemaining)) + '</div>' +
            '<div class="stat-sub">' + escHtml(t('dash.outstandingbalance')) + '</div>' +
          '</div>' +
          '<div class="stat-card">' +
            '<div class="stat-icon">🔨</div>' +
            '<div class="stat-label">' + escHtml(t('dash.activities')) + '</div>' +
            '<div class="stat-value">' + sum.activitiesCount + '</div>' +
            '<div class="stat-sub">' + escHtml(t('dash.completedN', { count: sum.completedCount })) + ' · ' + escHtml(t('dash.inprogressN', { count: sum.inProgressCount })) + '</div>' +
          '</div>' +
          '<div class="stat-card accent">' +
            '<div class="stat-icon">📋</div>' +
            '<div class="stat-label">' + escHtml(t('dash.pending')) + '</div>' +
            '<div class="stat-value">' + sum.pendingCount + '</div>' +
            '<div class="stat-sub">' + escHtml(t('dash.awaitingsettlement')) + '</div>' +
          '</div>' +
        '</div>' +

        /* Quick actions */
        '<div class="card mb-3">' +
          '<div class="card-header"><h2>' + escHtml(t('dash.quickactions')) + '</h2></div>' +
          '<div class="card-body">' +
            '<div class="quick-actions">' +
              '<div class="quick-tile" data-quick="new-activity"><div class="qt-icon">➕🔨</div><div class="qt-label">' + escHtml(t('dash.addactivity')) + '</div></div>' +
              '<div class="quick-tile" data-quick="goto-activities"><div class="qt-icon">📋</div><div class="qt-label">' + escHtml(t('dash.allactivities')) + '</div></div>' +
              '<div class="quick-tile" data-quick="goto-reports"><div class="qt-icon">📊</div><div class="qt-label">' + escHtml(t('dash.reports')) + '</div></div>' +
              '<div class="quick-tile" data-quick="goto-auditlog"><div class="qt-icon">📜</div><div class="qt-label">' + escHtml(t('dash.auditlog')) + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Recent activities */
        '<div class="card">' +
          '<div class="card-header"><h2>' + escHtml(t('dash.recentactivities')) + '</h2></div>' +
          '<div class="card-body" style="padding:0">' +
            renderTimelineActivities(acts) +
          '</div>' +
          '<div class="card-footer"><button class="btn btn-ghost btn-sm btn-full" data-nav="activities">' + escHtml(t('dash.viewall')) + '</button></div>' +
        '</div>' +
      '</div>';

    // quick tile handlers
    container.querySelectorAll('[data-quick]').forEach(function (tile) {
      tile.addEventListener('click', function () {
        var q = tile.getAttribute('data-quick');
        if (q === 'new-activity')         { navigate('activities'); setTimeout(function() { openActivityModal(null); }, 100); }
        else if (q === 'goto-activities') navigate('activities');
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
    if (!acts.length) return '<div class="empty-state" style="padding:1.5rem"><p>' + escHtml(t('dash.noactivities')) + '</p></div>';
    var dotClass = { completed: 'success', in_progress: '', pending: 'accent' };
    return '<div class="timeline" style="padding:0 1.25rem">' +
      acts.map(function (a) {
        return '<div class="timeline-item">' +
          '<div class="timeline-dot ' + (dotClass[a.status] || '') + '"></div>' +
          '<div class="timeline-content">' +
            '<div class="tl-title">' + escHtml(a.title) + '</div>' +
            '<div class="tl-meta">' + escHtml(t('cat.' + a.category) || a.category) + ' · ' + statusBadge(a.status) + ' · ' + fmt.relativeTime(a.updatedAt) + '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  /* ── ACTIVITIES ──────────────────────────────────────────── */
  /* ── ACTIVITIES ──────────────────────────────────────────── */
  var actFilter = { search: '', status: '', category: '' };

  var CATEGORIES = ['Demolition','Electrical','Plumbing','Tiling','Flooring','Plastering','Painting','Roofing','Windows','Doors','Insulation','Other'];

  function renderActivities(container) {
    container.innerHTML =
      '<div class="page-inner">' +
        '<div class="page-header">' +
          '<div><h1>' + escHtml(t('act.title')) + '</h1><p>' + escHtml(t('act.subtitle')) + '</p></div>' +
          '<div class="page-actions">' +
            '<button class="btn btn-primary" id="btn-new-activity">' + escHtml(t('act.new')) + '</button>' +
          '</div>' +
        '</div>' +

        '<div class="filter-bar">' +
          '<div class="search-wrap">' +
            '<span class="search-icon">🔍</span>' +
            '<input type="search" id="act-search" placeholder="' + escHtml(t('act.search')) + '" value="' + escHtml(actFilter.search) + '">' +
          '</div>' +
          '<select id="act-status-filter">' +
            '<option value="">' + escHtml(t('act.allstatuses')) + '</option>' +
            ['pending','in_progress','completed','cancelled']
              .map(function(s){ return '<option value="'+s+'"'+(actFilter.status===s?' selected':'')+'>'+escHtml(t('status.'+s))+'</option>'; }).join('') +
          '</select>' +
          '<select id="act-cat-filter">' +
            '<option value="">' + escHtml(t('act.allcats')) + '</option>' +
            CATEGORIES.map(function(c) { return '<option value="' + escHtml(c) + '"' + (actFilter.category===c?' selected':'') + '>' + escHtml(t('cat.'+c)) + '</option>'; }).join('') +
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
      if (actFilter.search && !(a.title + ' ' + a.category + ' ' + (a.contractor||'')).toLowerCase().includes(actFilter.search.toLowerCase())) return false;
      if (actFilter.status && a.status !== actFilter.status) return false;
      if (actFilter.category && a.category !== actFilter.category) return false;
      return true;
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  function renderActivitiesList(container) {
    var acts = getFilteredActivities();
    if (!acts.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔨</div><h3>' + escHtml(t('act.empty')) + '</h3><p>' + escHtml(t('act.emptysub')) + '</p></div>';
      return;
    }

    /* Compact list: each row shows date | tappable title | amount | actions */
    container.innerHTML =
      '<div class="card"><div class="act-list">' +
      acts.map(function (a) {
        var amtHtml = a.paymentAmount != null
          ? escHtml(fmt.currency(a.paymentAmount))
          : '<span class="text-muted">\u2014</span>';
        return '<div class="act-row compact">' +
          '<div class="act-row-left">' +
            '<span class="act-row-date">' + escHtml(fmt.date(a.date)) + '</span>' +
            '<button class="act-row-title-btn" data-action="open" data-act-id="' + escHtml(a.id) + '" title="' + escHtml(t('act.detail.title')) + '">' +
              escHtml(a.title) +
            '</button>' +
          '</div>' +
          '<span class="act-row-amount">' + amtHtml + '</span>' +
          '<div class="act-row-actions">' +
            '<button class="action-btn ghost" data-action="edit" data-act-id="' + escHtml(a.id) + '" aria-label="' + escHtml(t('act.edit')) + '">' +
              '<span class="emoji" aria-hidden="true">✏️</span>' +
              '<span class="label">' + escHtml(t('act.edit')) + '</span>' +
            '</button>' +
            '<button class="action-btn delete" data-action="delete" data-act-id="' + escHtml(a.id) + '" aria-label="' + escHtml(t('act.del')) + '">' +
              '<span class="emoji" aria-hidden="true">🗑️</span>' +
              '<span class="label">' + escHtml(t('act.del')) + '</span>' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('') +
      '</div></div>';

    /* Event delegation – assign onclick to prevent listener accumulation on re-renders */
    container.onclick = function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      var id     = btn.getAttribute('data-act-id');
      if (action === 'open')        { openActivityDetailModal(id); }
      else if (action === 'edit')   { openActivityModal(id); }
      else if (action === 'delete') {
        var a = DB.getActivityById(id);
        var msg = a ? (t('act.confirm.delete') || 'Delete?').replace('{title}', a.title) : 'Delete?';
        if (a && confirm(msg)) {
          DB.deleteActivity(id, (state.currentUser || {}).id);
          renderActivitiesList(container);
          toast(t('act.toast.deleted'), 'danger');
        }
      }
    };
  }

  /* ── Activity Detail Modal (read-only) ──────────────────── */
  function openActivityDetailModal(id) {
    var a = DB.getActivityById(id);
    if (!a) return;

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    /* Helper to render a single read-only field cell.
     * Pass rawHtml=true to treat `value` as pre-escaped HTML. */
    function field(labelKey, value, fullWidth, rawHtml) {
      var val;
      if (rawHtml) {
        val = value || '<span class="text-muted">\u2014</span>';
      } else {
        val = (value !== null && value !== undefined && String(value).trim() !== '')
          ? escHtml(String(value))
          : '<span class="text-muted">\u2014</span>';
      }
      return '<div class="act-detail-field' + (fullWidth ? ' act-detail-notes' : '') + '">' +
        '<span class="act-detail-label">' + escHtml(t(labelKey)) + '</span>' +
        '<span class="act-detail-value">' + val + '</span>' +
      '</div>';
    }

    /* Remaining shown in red when positive (matches list view behaviour) */
    var remainHtml = (a.remaining != null)
      ? (Number(a.remaining) > 0
          ? '<span class="text-danger">' + escHtml(fmt.currency(a.remaining)) + '</span>'
          : escHtml(fmt.currency(a.remaining || 0)))
      : null;

    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="' + escHtml(t('act.detail.title')) + '">' +
        '<div class="modal-header">' +
          '<h2>' + escHtml(t('act.detail.title')) + '</h2>' +
          '<button class="btn btn-ghost btn-icon" id="detail-modal-close" aria-label="' + escHtml(t('act.detail.close')) + '">\u2715</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="act-detail-grid">' +
            field('act.modal.fieldtitle',     a.title,                             true) +
            field('act.modal.fielddate',      fmt.date(a.date)) +
            field('act.modal.fieldcat',       t('cat.' + a.category) || a.category) +
            field('act.modal.fieldstatus',    t('status.' + a.status) || a.status) +
            field('act.modal.fieldamount',    a.paymentAmount != null ? fmt.currency(a.paymentAmount) : null) +
            field('act.modal.fieldtype',      a.paymentType ? methodLabel(a.paymentType) : null) +
            field('act.modal.fieldremaining', remainHtml, false, true) +
            field('act.modal.fieldwhopaid',   a.whoPaid) +
            field('act.modal.fieldcontractor',a.contractor) +
            field('act.modal.fieldsupplier',  a.supplier) +
            field('act.modal.fieldinvoice',   a.invoiceRef) +
            field('act.modal.fieldcurrency',  a.currency) +
            field('act.modal.fieldnotes',     a.notes,                             true) +
            field('act.detail.createdat',     a.createdAt ? fmt.relativeTime(a.createdAt) : null) +
            field('act.detail.updatedat',     a.updatedAt ? fmt.relativeTime(a.updatedAt) : null) +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" id="detail-modal-cancel">' + escHtml(t('act.detail.close')) + '</button>' +
          '<button class="btn btn-outline" id="detail-modal-edit">' + escHtml(t('act.edit')) + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    function closeDetail() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.querySelector('#detail-modal-close').addEventListener('click', closeDetail);
    overlay.querySelector('#detail-modal-cancel').addEventListener('click', closeDetail);
    overlay.querySelector('#detail-modal-edit').addEventListener('click', function () {
      closeDetail();
      openActivityModal(id);
    });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeDetail(); });
  }

  /* ── Activity Modal (create / edit) ─────────────────────── */
  function openActivityModal(id) {
    var editing = id ? DB.getActivityById(id) : null;
    var PAYMENT_TYPES = ['cash','bank_transfer','card','other'];

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    var modalTitle = editing ? t('act.modal.edit') : t('act.modal.new');
    var saveLabel  = editing ? t('act.modal.save') : t('act.modal.create');

    var catOptions = CATEGORIES.map(function(c) {
      var sel = ((editing||{}).category || 'Demolition') === c ? ' selected' : '';
      return '<option value="'+escHtml(c)+'"'+sel+'>'+escHtml(t('cat.'+c))+'</option>';
    }).join('');

    var statusOptions = ['pending','in_progress','completed','cancelled'].map(function(s) {
      var sel = ((editing||{}).status || 'pending') === s ? ' selected' : '';
      return '<option value="'+s+'"'+sel+'>'+escHtml(t('status.'+s))+'</option>';
    }).join('');

    var typeOptions = PAYMENT_TYPES.map(function(m) {
      var sel = ((editing||{}).paymentType || 'cash') === m ? ' selected' : '';
      return '<option value="'+m+'"'+sel+'>'+escHtml(methodLabel(m))+'</option>';
    }).join('');

    var amountVal  = (editing && editing.paymentAmount != null) ? String(editing.paymentAmount) : '';
    var remainVal  = (editing && editing.remaining  != null)    ? String(editing.remaining)     : '0';
    var req = ' <span style="color:var(--ico-danger)">*</span>';

    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="' + escHtml(modalTitle) + '">' +
        '<div class="modal-header">' +
          '<h2>' + escHtml(modalTitle) + '</h2>' +
          '<button class="btn btn-ghost btn-icon" id="modal-close" aria-label="Close">\u2715</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<form id="activity-form" class="activity-form">' +
            '<div class="form-grid">' +

              /* ── Mandatory fields section ── */
              '<div class="form-section-label">' + escHtml(t('act.form.mandatory')) + '</div>' +

              /* Row: date + title */
              '<div class="form-group">' +
                '<label for="act-date">' + escHtml(t('act.modal.fielddate')) + req + '</label>' +
                '<input class="form-control" id="act-date" name="date" type="date" required value="' + escHtml((editing||{}).date||ICO.today()) + '">' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="act-title">' + escHtml(t('act.modal.fieldtitle')) + req + '</label>' +
                '<input class="form-control" id="act-title" name="title" required value="' + escHtml((editing||{}).title||'') + '">' +
              '</div>' +

              /* Row: payment amount + remaining */
              '<div class="form-group">' +
                '<label for="act-payment-amount">' + escHtml(t('act.modal.fieldamount')) + req + '</label>' +
                '<input class="form-control" id="act-payment-amount" name="paymentAmount" type="number" min="0" step="0.01" required value="' + escHtml(amountVal) + '" placeholder="0.00">' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="act-remaining">' + escHtml(t('act.modal.fieldremaining')) + req + '</label>' +
                '<input class="form-control" id="act-remaining" name="remaining" type="number" min="0" step="0.01" required value="' + escHtml(remainVal) + '" placeholder="0.00">' +
              '</div>' +

              /* ── Optional fields section ── */
              '<div class="form-section-label">' + escHtml(t('act.form.optional')) + '</div>' +

              /* Row: payment type + currency */
              '<div class="form-group">' +
                '<label for="act-payment-type">' + escHtml(t('act.modal.fieldtype')) + '</label>' +
                '<select class="form-control" id="act-payment-type" name="paymentType" required>' + typeOptions + '</select>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="act-currency">' + escHtml(t('act.modal.fieldcurrency')) + '</label>' +
                '<input class="form-control" id="act-currency" name="currency" value="' + escHtml((editing||{}).currency||'') + '" placeholder="e.g. GBP">' +
              '</div>' +

              /* Row: status + who paid */
              '<div class="form-group">' +
                '<label for="act-status">' + escHtml(t('act.modal.fieldstatus')) + '</label>' +
                '<select class="form-control" id="act-status" name="status">' + statusOptions + '</select>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="act-whopaid">' + escHtml(t('act.modal.fieldwhopaid')) + '</label>' +
                '<input class="form-control" id="act-whopaid" name="whoPaid" value="' + escHtml((editing||{}).whoPaid||'') + '">' +
              '</div>' +

              /* Row: category + contractor/supplier */
              '<div class="form-group">' +
                '<label for="act-category">' + escHtml(t('act.modal.fieldcat')) + '</label>' +
                '<select class="form-control" id="act-category" name="category">' + catOptions + '</select>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="act-contractor">' + escHtml(t('act.modal.fieldcontractor')) + '</label>' +
                '<input class="form-control" id="act-contractor" name="contractor" value="' + escHtml((editing||{}).contractor||'') + '">' +
              '</div>' +

              /* Row: supplier + invoice ref */
              '<div class="form-group">' +
                '<label for="act-supplier">' + escHtml(t('act.modal.fieldsupplier')) + '</label>' +
                '<input class="form-control" id="act-supplier" name="supplier" value="' + escHtml((editing||{}).supplier||'') + '">' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="act-invoiceref">' + escHtml(t('act.modal.fieldinvoice')) + '</label>' +
                '<input class="form-control" id="act-invoiceref" name="invoiceRef" value="' + escHtml((editing||{}).invoiceRef||'') + '">' +
              '</div>' +

              /* Notes – full width, last */
              '<div class="form-group full">' +
                '<label for="act-notes">' + escHtml(t('act.modal.fieldnotes')) + '</label>' +
                '<textarea class="form-control" id="act-notes" name="notes" rows="3">' + escHtml((editing||{}).notes||'') + '</textarea>' +
              '</div>' +

            '</div>' +
          '</form>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" id="modal-cancel">' + escHtml(t('act.modal.cancel')) + '</button>' +
          '<button class="btn btn-primary" id="modal-save">' + escHtml(saveLabel) + '</button>' +
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
        title:         form.elements['title'].value.trim(),
        date:          form.elements['date'].value,
        category:      form.elements['category'].value,
        status:        form.elements['status'].value,
        contractor:    form.elements['contractor'].value.trim(),
        notes:         form.elements['notes'].value.trim(),
        paymentAmount: parseFloat(form.elements['paymentAmount'].value) || 0,
        paymentType:   form.elements['paymentType'].value,
        remaining:     parseFloat(form.elements['remaining'].value) || 0,
        whoPaid:       form.elements['whoPaid'].value.trim(),
        supplier:      form.elements['supplier'].value.trim(),
        invoiceRef:    form.elements['invoiceRef'].value.trim(),
        currency:      form.elements['currency'].value.trim()
      };
      if (editing) {
        DB.updateActivity(id, data, (state.currentUser||{}).id);
        toast(t('act.toast.updated'), 'success');
      } else {
        DB.createActivity(data, (state.currentUser||{}).id);
        toast(t('act.toast.created'), 'success');
      }
      closeModal();
      var list = document.getElementById('activities-list');
      if (list) renderActivitiesList(list);
      if (state.currentPage === 'dashboard') navigate('dashboard');
    });
  }

  /* ── REPORTS ─────────────────────────────────────────────── */
  var reportFilter = { dateFrom: '', dateTo: '', category: '', status: '', search: '' };

  function getFilteredReportActivities() {
    return DB.getActivities().filter(function (a) {
      if (reportFilter.dateFrom && a.date < reportFilter.dateFrom) return false;
      if (reportFilter.dateTo   && a.date > reportFilter.dateTo)   return false;
      if (reportFilter.category && a.category !== reportFilter.category) return false;
      if (reportFilter.status   && a.status   !== reportFilter.status)  return false;
      if (reportFilter.search) {
        var haystack = (a.title + ' ' + (a.contractor||'') + ' ' + (a.notes||'')).toLowerCase();
        if (!haystack.includes(reportFilter.search.toLowerCase())) return false;
      }
      return true;
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  function renderReports(container) {
    container.innerHTML =
      '<div class="page-inner">' +
        '<div class="page-header">' +
          '<div><h1>' + escHtml(t('rep.title')) + '</h1><p>' + escHtml(t('rep.subtitle')) + '</p></div>' +
          '<div class="page-actions">' +
            '<button class="btn btn-ghost btn-sm" id="btn-print">' + escHtml(t('rep.print')) + '</button>' +
          '</div>' +
        '</div>' +

        '<div class="filter-bar filter-bar-wrap">' +
          '<div class="search-wrap">' +
            '<span class="search-icon">🔍</span>' +
            '<input type="search" id="rep-search" placeholder="' + escHtml(t('rep.search')) + '" value="' + escHtml(reportFilter.search) + '">' +
          '</div>' +
          '<input type="date" id="rep-date-from" class="filter-date" title="From date" value="' + escHtml(reportFilter.dateFrom) + '">' +
          '<input type="date" id="rep-date-to"   class="filter-date" title="To date"   value="' + escHtml(reportFilter.dateTo) + '">' +
          '<select id="rep-cat-filter">' +
            '<option value="">' + escHtml(t('rep.allcats')) + '</option>' +
            CATEGORIES.map(function(c){ return '<option value="'+escHtml(c)+'"'+(reportFilter.category===c?' selected':'')+'>'+escHtml(t('cat.'+c))+'</option>'; }).join('') +
          '</select>' +
          '<select id="rep-status-filter">' +
            '<option value="">' + escHtml(t('rep.allstatuses')) + '</option>' +
            ['pending','in_progress','completed','cancelled']
              .map(function(s){ return '<option value="'+s+'"'+(reportFilter.status===s?' selected':'')+'>'+escHtml(t('status.'+s))+'</option>'; }).join('') +
          '</select>' +
          '<button class="btn btn-ghost btn-sm" id="rep-reset-filters">' + escHtml(t('rep.reset')) + '</button>' +
        '</div>' +

        '<div id="report-content"></div>' +
      '</div>';

    function rebuildReportContent() {
      var acts = getFilteredReportActivities();
      var totalPaid      = acts.reduce(function(s,a){ return s + Number(a.paymentAmount||0); }, 0);
      var totalRemaining = acts.reduce(function(s,a){ return s + Number(a.remaining||0); }, 0);
      var pendingCount   = acts.filter(function(a){ return a.status === 'pending'; }).length;

      /* Spend by category */
      var byCat = {};
      acts.forEach(function(a){
        var cat = a.category || 'Other';
        if (!byCat[cat]) byCat[cat] = 0;
        byCat[cat] += Number(a.paymentAmount||0);
      });
      var catEntries = Object.keys(byCat).map(function(k){ return [k, byCat[k]]; }).sort(function(a,b){ return b[1]-a[1]; });
      var maxCat = catEntries.length ? catEntries[0][1] : 1;

      /* By payment type */
      var byType = {};
      acts.forEach(function(a){
        var type = a.paymentType || 'other';
        if (!byType[type]) byType[type] = 0;
        byType[type] += Number(a.paymentAmount||0);
      });
      var typeEntries = Object.keys(byType).map(function(k){ return [k, byType[k]]; }).sort(function(a,b){ return b[1]-a[1]; });
      var totalAll = acts.reduce(function(s,a){ return s+Number(a.paymentAmount||0); }, 0);

      /* Group by date */
      var grouped = {};
      acts.forEach(function(a){
        if (!grouped[a.date]) grouped[a.date] = [];
        grouped[a.date].push(a);
      });
      var groupedDates = Object.keys(grouped).sort(function(a,b){ return b.localeCompare(a); });

      var content = document.getElementById('report-content');
      if (!content) return;

      content.innerHTML =
        '<div class="report-summary-grid">' +
          '<div class="stat-card">' +
            '<div class="stat-label">' + escHtml(t('rep.totalspent')) + '</div>' +
            '<div class="stat-value">' + escHtml(fmt.currency(totalPaid)) + '</div>' +
            '<div class="stat-sub">' + escHtml(t('rep.paidacts', { count: acts.filter(function(a){ return Number(a.paymentAmount||0)>0; }).length })) + '</div>' +
          '</div>' +
          '<div class="stat-card danger">' +
            '<div class="stat-label">' + escHtml(t('rep.totalremaining')) + '</div>' +
            '<div class="stat-value">' + escHtml(fmt.currency(totalRemaining)) + '</div>' +
            '<div class="stat-sub">' + escHtml(t('rep.outstanding')) + '</div>' +
          '</div>' +
          '<div class="stat-card accent">' +
            '<div class="stat-label">' + escHtml(t('rep.pendingcount')) + '</div>' +
            '<div class="stat-value">' + pendingCount + '</div>' +
            '<div class="stat-sub">' + escHtml(t('rep.pendingacts')) + '</div>' +
          '</div>' +
          '<div class="stat-card">' +
            '<div class="stat-label">' + escHtml(t('rep.matched')) + '</div>' +
            '<div class="stat-value">' + acts.length + '</div>' +
            '<div class="stat-sub">' + escHtml(t('rep.ofTotal', { total: DB.getActivities().length })) + '</div>' +
          '</div>' +
        '</div>' +

        (acts.length === 0 ?
          '<div class="empty-state"><div class="empty-icon">📊</div><h3>' + escHtml(t('rep.empty')) + '</h3><p>' + escHtml(t('rep.emptysub')) + '</p></div>' :

          '<div class="grid-2 mb-3">' +
            '<div class="card">' +
              '<div class="card-header"><h2>' + escHtml(t('rep.bycategory')) + '</h2></div>' +
              '<div class="card-body">' +
                (catEntries.length === 0 ? '<p class="text-muted">' + escHtml(t('rep.nodata')) + '</p>' :
                  catEntries.map(function(ce){
                    var pct = maxCat > 0 ? Math.round(ce[1]/maxCat*100) : 0;
                    return '<div class="report-bar-wrap">' +
                      '<div class="report-row" style="padding:.2rem 0">' +
                        '<span class="label">' + escHtml(t('cat.'+ce[0])) + '</span>' +
                        '<span class="value">' + escHtml(fmt.currency(ce[1])) + '</span>' +
                      '</div>' +
                      '<div class="report-bar-outer"><div class="report-bar-inner accent" style="width:'+pct+'%"></div></div>' +
                    '</div>';
                  }).join('')) +
              '</div>' +
            '</div>' +
            '<div class="card">' +
              '<div class="card-header"><h2>' + escHtml(t('rep.bytype')) + '</h2></div>' +
              '<div class="card-body">' +
                (typeEntries.length === 0 ? '<p class="text-muted">' + escHtml(t('rep.nodata')) + '</p>' :
                  typeEntries.map(function(me){
                    var pct = totalAll > 0 ? Math.round(me[1]/totalAll*100) : 0;
                    return '<div class="report-row">' +
                      '<span class="label">' + escHtml(methodLabel(me[0])) + '</span>' +
                      '<span class="value">' + escHtml(fmt.currency(me[1])) + ' <small class="text-muted">('+pct+'%)</small></span>' +
                    '</div>';
                  }).join('')) +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="card mb-3">' +
            '<div class="card-header"><h2>' + escHtml(t('rep.bydate')) + '</h2></div>' +
            groupedDates.map(function(date){
              var group = grouped[date];
              var groupTotal = group.reduce(function(s,a){ return s+Number(a.paymentAmount||0); }, 0);
              return '<div class="report-date-group">' +
                '<div class="report-date-header">' +
                  '<span>' + escHtml(fmt.date(date)) + '</span>' +
                  '<span class="report-date-total">' + escHtml(fmt.currency(groupTotal)) + '</span>' +
                '</div>' +
                '<div class="data-table-wrap"><table class="data-table"><tbody>' +
                group.map(function(a){
                  return '<tr>' +
                    '<td><strong>' + escHtml(a.title) + '</strong></td>' +
                    '<td><span class="badge badge-info">' + escHtml(t('cat.'+a.category)) + '</span></td>' +
                    '<td>' + statusBadge(a.status) + '</td>' +
                    '<td><strong>' + escHtml(fmt.currency(a.paymentAmount||0)) + '</strong>' +
                      (Number(a.remaining)>0 ? '<br><small class="text-danger">'+escHtml(t('act.col.remaining'))+': '+escHtml(fmt.currency(a.remaining))+'</small>' : '') +
                    '</td>' +
                    '<td><span class="badge badge-default">' + escHtml(methodLabel(a.paymentType)) + '</span></td>' +
                  '</tr>';
                }).join('') +
                '</tbody></table></div>' +
              '</div>';
            }).join('') +
          '</div>');
    }

    rebuildReportContent();

    var filterIds  = ['rep-search','rep-date-from','rep-date-to','rep-cat-filter','rep-status-filter'];
    var filterKeys = ['search','dateFrom','dateTo','category','status'];
    filterIds.forEach(function(fid, i) {
      var el = container.querySelector('#' + fid);
      if (!el) return;
      el.addEventListener('input',  function(e){ reportFilter[filterKeys[i]] = e.target.value; rebuildReportContent(); });
      el.addEventListener('change', function(e){ reportFilter[filterKeys[i]] = e.target.value; rebuildReportContent(); });
    });
    container.querySelector('#rep-reset-filters').addEventListener('click', function() {
      reportFilter = { dateFrom:'', dateTo:'', category:'', status:'', search:'' };
      navigate('reports');
    });
    container.querySelector('#btn-print').addEventListener('click', function() { window.print(); });
  }

  /* ── AUDIT LOG ───────────────────────────────────────────── */
  var auditFilter = { dateFrom: '', dateTo: '', userId: '', action: '', entity: '' };

  function renderAuditLog(container) {
    var profs = DB.getProfiles();
    container.innerHTML =
      '<div class="page-inner">' +
        '<div class="page-header">' +
          '<div><h1>' + escHtml(t('aud.title')) + '</h1><p>' + escHtml(t('aud.subtitle')) + '</p></div>' +
          '<div class="page-actions">' +
            '<button class="btn btn-danger btn-sm" id="btn-clear-log">' + escHtml(t('aud.clearlog')) + '</button>' +
          '</div>' +
        '</div>' +

        '<div class="filter-bar">' +
          '<input type="date" id="aud-date-from" class="filter-date" title="From date" value="' + escHtml(auditFilter.dateFrom) + '">' +
          '<input type="date" id="aud-date-to"   class="filter-date" title="To date"   value="' + escHtml(auditFilter.dateTo) + '">' +
          '<select id="aud-user-filter">' +
            '<option value="">' + escHtml(t('aud.allusers')) + '</option>' +
            profs.map(function(p){ return '<option value="'+escHtml(p.id)+'"'+(auditFilter.userId===p.id?' selected':'')+'>'+escHtml(p.name)+'</option>'; }).join('') +
          '</select>' +
          '<select id="aud-action-filter">' +
            '<option value="">' + escHtml(t('aud.allactions')) + '</option>' +
            ['create','update','delete','login','logout']
              .map(function(a){ return '<option value="'+a+'"'+(auditFilter.action===a?' selected':'')+'>'+a.charAt(0).toUpperCase()+a.slice(1)+'</option>'; }).join('') +
          '</select>' +
          '<select id="aud-entity-filter">' +
            '<option value="">' + escHtml(t('aud.allentities')) + '</option>' +
            ['Activity','Payment','Profile']
              .map(function(e){ return '<option value="'+e+'"'+(auditFilter.entity===e?' selected':'')+'>'+e+'</option>'; }).join('') +
          '</select>' +
          '<button class="btn btn-ghost btn-sm" id="aud-reset-filters">' + escHtml(t('aud.reset')) + '</button>' +
        '</div>' +

        '<div id="audit-log-content"></div>' +
      '</div>';

    renderAuditLogContent(container.querySelector('#audit-log-content'));

    container.querySelector('#btn-clear-log').addEventListener('click', function () {
      if (confirm(t('aud.confirmclear'))) {
        DB.clearAuditLog();
        renderAuditLogContent(container.querySelector('#audit-log-content'));
        toast(t('aud.cleared'), 'warning');
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
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📜</div><h3>' + escHtml(t('aud.empty')) + '</h3><p>' + escHtml(t('aud.emptysub')) + '</p></div>';
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
                  (hasSnapshots ? '<br><button class="btn btn-ghost btn-sm audit-detail-btn" data-audit-id="' + escHtml(entry.id) + '" style="margin-top:.3rem;font-size:.75rem">' + escHtml(t('aud.viewchanges')) + '</button>' : '') +
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
      if (!snapshot) return '<em class="text-muted">\u2014</em>';
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
            '<td class="text-danger">' + escHtml(String(prev[k]||'\u2014')) + '</td>' +
            '<td class="text-success">' + escHtml(String(next[k]||'\u2014')) + '</td>' +
          '</tr>';
        }).join('') +
      '</tbody></table>';
    }

    var hasBoth = entry.prevSnapshot && entry.newSnapshot;
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    var detailTitle = t('aud.changes');
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="' + escHtml(detailTitle) + '">' +
        '<div class="modal-header">' +
          '<h2>' + escHtml(detailTitle) + '</h2>' +
          '<button class="btn btn-ghost btn-icon" id="aud-detail-close" aria-label="Close">\u2715</button>' +
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
          '<button class="btn btn-ghost" id="aud-detail-done">' + escHtml(t('common.close')) + '</button>' +
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
          '<div><h1>' + escHtml(t('set.title')) + '</h1><p>' + escHtml(t('set.subtitle')) + '</p></div>' +
        '</div>' +

        '<div class="settings-section">' +
          '<h2 class="settings-section-title">' + escHtml(t('set.datamgmt')) + '</h2>' +
          '<div class="settings-cards">' +

            '<div class="settings-card">' +
              '<div class="settings-card-icon">📤</div>' +
              '<div class="settings-card-body">' +
                '<div class="settings-card-title">' + escHtml(t('set.export')) + '</div>' +
                '<div class="settings-card-desc">' + escHtml(t('set.exportdesc')) + '</div>' +
                '<button class="btn btn-outline btn-sm mt-2" id="btn-export">' + escHtml(t('set.exportbtn')) + '</button>' +
              '</div>' +
            '</div>' +

            '<div class="settings-card">' +
              '<div class="settings-card-icon">📥</div>' +
              '<div class="settings-card-body">' +
                '<div class="settings-card-title">' + escHtml(t('set.import')) + '</div>' +
                '<div class="settings-card-desc">' + escHtml(t('set.importdesc')) + '</div>' +
                '<label class="btn btn-outline btn-sm mt-2" style="cursor:pointer">' +
                  escHtml(t('set.importbtn')) + '<input type="file" id="import-file" accept=".json" style="display:none">' +
                '</label>' +
              '</div>' +
            '</div>' +

            '<div class="settings-card settings-card-danger">' +
              '<div class="settings-card-icon">\u26a0\ufe0f</div>' +
              '<div class="settings-card-body">' +
                '<div class="settings-card-title">' + escHtml(t('set.reset')) + '</div>' +
                '<div class="settings-card-desc">' + escHtml(t('set.resetdesc')) + '</div>' +
                '<button class="btn btn-danger btn-sm mt-2" id="btn-reset">' + escHtml(t('set.resetbtn')) + '</button>' +
              '</div>' +
            '</div>' +

          '</div>' +
        '</div>' +

        '<div class="settings-section">' +
          '<h2 class="settings-section-title">' + escHtml(t('set.appinfo')) + '</h2>' +
          '<div class="card">' +
            '<div class="card-body">' +
              '<dl class="detail-grid">' +
                '<dt>App Name</dt><dd><strong>' + escHtml(t('set.appname')) + '</strong></dd>' +
                '<dt>' + escHtml(t('set.version')) + '</dt><dd>' + escHtml(APP_VERSION) + '</dd>' +
                '<dt>' + escHtml(t('set.storage')) + '</dt><dd>' + escHtml(t('set.storageval')) + '</dd>' +
                '<dt>' + escHtml(t('set.activities')) + '</dt><dd>' + DB.getActivities().length + ' ' + escHtml(t('set.records')) + '</dd>' +
                '<dt>' + escHtml(t('set.auditentries')) + '</dt><dd>' + DB.getAuditLog().length + ' ' + escHtml(t('set.entries')) + '</dd>' +
              '</dl>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="settings-section">' +
          '<h2 class="settings-section-title">' + escHtml(t('set.cloudsync')) + ' <span class="badge badge-accent" style="vertical-align:middle">Coming Soon</span></h2>' +
          '<div class="card">' +
            '<div class="card-body">' +
              '<div class="empty-state" style="padding:1.5rem">' +
                '<div class="empty-icon">\u2601\ufe0f</div>' +
                '<h3>Supabase Integration</h3>' +
                '<p>' + escHtml(t('set.clouddesc')) + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

      '</div>';

    container.querySelector('#btn-export').addEventListener('click', function() {
      var data = DB.exportAllData();
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url  = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'ico-data-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      toast(t('set.exported'), 'success');
    });

    container.querySelector('#import-file').addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        try {
          var data = JSON.parse(ev.target.result);
          DB.importAllData(data);
          toast(t('set.imported'), 'success');
          setTimeout(function() { navigate('dashboard'); }, 1000);
        } catch (err) {
          toast(t('set.importfail'), 'danger');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    container.querySelector('#btn-reset').addEventListener('click', function() {
      if (confirm(t('set.confirmreset'))) {
        DB.resetAllData();
        toast(t('set.resetdone'), 'warning');
        setTimeout(function() { navigate('dashboard'); }, 800);
      }
    });
  }

  /* ── Bootstrap ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    // Restore persisted language
    try {
      var savedLang = localStorage.getItem('ico_lang');
      if (savedLang && TRANSLATIONS[savedLang]) state.lang = savedLang;
    } catch (e) { /* ignore */ }

    initProfileForm();

    runSplash(function () {
      showProfileScreen();
    });
  });

})();
