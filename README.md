# ICO – Renovation Reporting

**Innovation Creation Opportunities** – a browser-based renovation tracking and reporting app.  
Built with vanilla HTML, CSS, and JavaScript.  Hosted via GitHub Pages / Jekyll.

---

## Features

- **Dashboard** – summary statistics and recent activity feed
- **Activities** – track every renovation task (create, edit, filter, delete)
- **Payments** – record and manage financial transactions with status tracking
- **Reports** – filterable financial breakdowns by payer, category, method, and date
- **Audit Log** – full change history with before/after snapshots
- **Settings** – export, import, and reset app data

---

## Architecture (Phase 3)

The codebase is organised for clean separation of concerns and Supabase-readiness.  
Scripts are loaded in dependency order from `index.html`:

```
assets/js/
├── config.js                   # App config + Supabase credential placeholders
├── utils.js                    # Shared helpers: uid(), today(), nowISO(), fmt.*
├── services/
│   ├── storage.js              # localStorage abstraction (ICO.StorageService)
│   ├── auditService.js         # Append-only audit log  (ICO.AuditService)
│   ├── authService.js          # Profiles + login/logout (ICO.AuthService)
│   ├── activityService.js      # Activity CRUD           (ICO.ActivityService)
│   ├── paymentService.js       # Payment CRUD            (ICO.PaymentService)
│   └── reportService.js        # Summary, export, import, reset (ICO.ReportService)
├── data.js                     # Backward-compat shim    (ICO.DB → services)
└── app.js                      # UI layer (routing, rendering, event handling)
assets/css/
└── style.css                   # All styles
```

### Service interfaces

Each service in `assets/js/services/` exposes a documented interface.  
When Supabase is integrated in Phase 4, only the service implementations change—the UI in `app.js` and the interface contracts remain the same.

| Service | Namespace | Responsibility |
|---|---|---|
| Storage | `ICO.StorageService` | Key/value persistence |
| Audit | `ICO.AuditService` | Append-only change history |
| Auth | `ICO.AuthService` | Profile management, login/logout events |
| Activity | `ICO.ActivityService` | Renovation activity CRUD |
| Payment | `ICO.PaymentService` | Financial payment CRUD |
| Report | `ICO.ReportService` | Summary stats, export, import, reset |

### Backward compatibility

`ICO.DB` (defined in `data.js`) is a thin shim that delegates every call to the appropriate service above.  `app.js` continues to use `ICO.DB` so no UI changes were needed in this phase.

---

## Phase 4 – Supabase Integration

> **Not yet implemented.**  This section describes the planned migration path.

### What changes

1. **`assets/js/config.js`** – fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY`  
   (use environment variables or a build step; never commit real keys).

2. **`assets/js/services/storage.js`** – replace `localStorage` calls with  
   Supabase table reads/writes.  Because the service interface is unchanged,  
   no other file needs to know about this swap.

3. **`assets/js/services/authService.js`** – wire `login()` and `logout()` to  
   `supabase.auth.signInWithPassword()` / `signOut()`.  Replace `getAll()` and  
   `create()` with queries against a `profiles` table.

4. **`assets/js/services/activityService.js`**, **`paymentService.js`** – replace  
   `ICO.StorageService` calls with `supabase.from('activities')` (or `payments`)  
   `.select()` / `.insert()` / `.update()` / `.delete()`.

5. **`assets/js/services/auditService.js`** – `log()` becomes an INSERT into an  
   `audit_log` table with an RLS policy that permits INSERT only (no UPDATE/DELETE).

6. **`assets/js/services/reportService.js`** – `getSummary()` can be replaced with  
   a Supabase RPC function for efficiency; `exportAll()` / `importAll()` remain  
   client-side bundle operations.

### Supabase table schema (suggested)

```sql
-- profiles
create table profiles (
  id          text primary key,
  name        text not null,
  initials    text,
  role        text,
  created_at  timestamptz default now()
);

-- activities
create table activities (
  id           text primary key,
  title        text not null,
  category     text,
  date         date,
  status       text,
  responsible  text references profiles(id),
  contractor   text,
  description  text,
  notes        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- payments
create table payments (
  id           text primary key,
  date         date,
  amount       numeric,
  paid_by      text references profiles(id),
  method       text,
  status       text,
  activity_id  text references activities(id),
  reference    text,
  notes        text,
  remaining    numeric default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- audit_log (append-only via RLS)
create table audit_log (
  id             text primary key,
  ts             timestamptz default now(),
  action         text,
  entity         text,
  entity_id      text,
  entity_name    text,
  detail         text,
  user_id        text references profiles(id),
  prev_snapshot  jsonb,
  new_snapshot   jsonb
);
```

---

## Local development

The app is a static site with no build step.  Open `index.html` directly in a browser, or serve with Jekyll:

```bash
bundle exec jekyll serve
```
