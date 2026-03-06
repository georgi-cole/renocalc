# ICO – Renovation Reporting

**Innovation Creation Opportunities** – a browser-based renovation tracking and reporting app.  
Built with vanilla HTML, CSS, and JavaScript.  Hosted via GitHub Pages / Jekyll.

---

## Features

- **Dashboard** – summary statistics and recent activity feed
- **Activities** – track every renovation task (create, edit, filter, delete)
- **Reports** – filterable financial breakdowns by category, method, and date
- **Audit Log** – full change history with before/after snapshots
- **Settings** – export, import, and reset app data

---

## Architecture (Phase 4 – Supabase ready)

The codebase uses a layered service architecture with a **local-first fallback**:
- When `SUPABASE_URL` and `SUPABASE_ANON_KEY` are configured the app persists data in Supabase.
- When those values are absent (or empty) every service falls back to `localStorage`-based storage automatically.

Scripts are loaded in dependency order from `index.html`:

```
assets/js/
├── config.js                        # App config + Supabase credential placeholders
├── utils.js                         # Shared helpers: uid(), today(), nowISO(), fmt.*
├── services/
│   ├── supabaseClient.js            # Initialises ICO.SupabaseClient (null if no config)
│   │
│   ├── storage.js                   # localStorage abstraction  (ICO.StorageService)
│   ├── auditService.js              # Local audit log            (ICO.AuditService)
│   ├── authService.js               # Local profiles / session   (ICO.AuthService)
│   ├── activityService.js           # Local activity CRUD        (ICO.ActivityService)
│   ├── paymentService.js            # Local payment CRUD         (ICO.PaymentService)
│   ├── reportService.js             # Summary, export/import/reset (ICO.ReportService)
│   │
│   ├── supabaseAuditService.js      # ↳ overrides ICO.AuditService    when Supabase active
│   ├── supabaseAuthService.js       # ↳ overrides ICO.AuthService     when Supabase active
│   ├── supabaseActivityService.js   # ↳ overrides ICO.ActivityService when Supabase active
│   │
│   └── local/                       # Reference copies of local service implementations
│       ├── storage.js
│       ├── auditService.js
│       ├── authService.js
│       ├── activityService.js
│       └── paymentService.js
├── data.js                          # Backward-compat shim  (ICO.DB → services)
└── app.js                           # UI layer (routing, rendering, event handling)
assets/css/
└── style.css                        # All styles
migrations/
└── sql/
    └── 2026-03-06-create-tables.sql # Supabase schema migration
```

### Service interfaces

| Service | Namespace | Responsibility |
|---|---|---|
| Storage | `ICO.StorageService` | Key/value localStorage persistence |
| Audit | `ICO.AuditService` | Append-only change history |
| Auth | `ICO.AuthService` | Profile management, login/logout events |
| Activity | `ICO.ActivityService` | Renovation activity CRUD (includes payment fields) |
| Payment | `ICO.PaymentService` | Financial payment CRUD |
| Report | `ICO.ReportService` | Summary stats, export, import, reset |

### How the fallback works

1. `supabaseClient.js` is loaded first and sets `ICO.SupabaseClient` – either a live Supabase client (when credentials are present) or `null`.
2. The local service files are then loaded, registering the default, local-first implementations on the global `ICO` namespace (e.g. `ICO.StorageService`, `ICO.AuditService`, `ICO.AuthService`, `ICO.ActivityService`, `ICO.PaymentService`, `ICO.ReportService`).
3. Finally, the `supabase*Service.js` files each check `if (!ICO.SupabaseClient) { return; }` at the top. When Supabase is active they replace the corresponding `ICO.*` namespace with a cloud-backed implementation that maintains an in-memory cache for synchronous reads and flushes mutations to Supabase asynchronously.

### Backward compatibility

`ICO.DB` (defined in `data.js`) is a thin shim that delegates every call to the appropriate service above.  `app.js` continues to use `ICO.DB` unchanged.

---

## Supabase Setup

### 1. Create a Supabase project

Sign up at [supabase.com](https://supabase.com) and create a new project.

### 2. Run the SQL migration

Open your project's **SQL Editor** and run the contents of:

```
migrations/sql/2026-03-06-create-tables.sql
```

This creates the `profiles`, `activities`, and `audit_logs` tables with Row-Level Security enabled and example policies.

> **Review the RLS policies** inside the migration file before going to production – the bundled policies are permissive examples marked with `TODO` comments.

### 3. Configure credentials locally

Copy `assets/js/config.js` and fill in your project values:

```js
SUPABASE_URL:      'https://your-project-ref.supabase.co',
SUPABASE_ANON_KEY: 'your-anon-key-here',
```

⚠️ **Do not commit real credentials.**  Add `assets/js/config.js` to `.gitignore`
(or use a separate `config.local.js` that is git-ignored) so your keys are never
pushed to the repository.

If you later add a Vite / webpack build step, replace the hard-coded strings with
`import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`,
and store the actual values in `.env.local` (see `.env.example` for the template).

### 4. Verify the connection

Open the browser console after loading the app.  You should see:

```
[ICO] Supabase client initialised – cloud persistence active.
[ICO:AuditService]    Loaded N audit entries from Supabase.
[ICO:AuthService]     Loaded N profiles from Supabase.
[ICO:ActivityService] Loaded N activities from Supabase.
```

### 5. Supabase Auth (email / password) – optional next step

The current implementation stores and retrieves profiles directly from the
`profiles` table without Supabase Auth credentials.  To add email / password
authentication:

1. Enable **Email** provider in Supabase → Authentication → Providers.
2. Extend `supabaseAuthService.js` `create()` to call  
   `supabase.auth.signUp({ email, password })` and set the profile `id` equal to  
   the returned auth UID so that RLS policies using `auth.uid()` work correctly.
3. Add an email / password sign-in form (or adapt the existing profile picker)  
   to call `supabase.auth.signInWithPassword({ email, password })`.

---

## Data Migration Helper

To import existing local demo data into Supabase after initial setup, export
your data from the Settings page (JSON download), then use the Supabase Table
Editor or a Node.js script to bulk-insert the records.

A minimal import script outline (save as `tools/import-to-supabase.js` and run
with Node ≥ 18):

```js
import { createClient } from '@supabase/supabase-js';
import data from './export.json' assert { type: 'json' };

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Helper: convert camelCase keys from the export into snake_case columns
const toSnakeCase = (key) =>
  key.replace(/([A-Z])/g, '_$1').toLowerCase();

const mapRecordToSnakeCase = (record) =>
  Object.fromEntries(
    Object.entries(record).map(([k, v]) => [toSnakeCase(k), v]),
  );

const mapArrayToSnakeCase = (records = []) => records.map(mapRecordToSnakeCase);

await sb.from('profiles').upsert(mapArrayToSnakeCase(data.profiles));
await sb.from('activities').upsert(mapArrayToSnakeCase(data.activities));
await sb.from('audit_logs').upsert(mapArrayToSnakeCase(data.auditLog));
console.log('Import complete.');
```

> Use the **service role key** (not the anon key) for bulk imports so RLS does
> not block the inserts.  Never commit the service role key.

---

## Local development

The app is a static site with no build step.  Open `index.html` directly in a
browser, or serve with Jekyll:

```bash
bundle exec jekyll serve
```

To run **without** Supabase (local-first mode), leave `SUPABASE_URL` and
`SUPABASE_ANON_KEY` empty in `assets/js/config.js`.  All data will be stored in
`localStorage` as before.
