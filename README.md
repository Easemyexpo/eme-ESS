# EME People

Employee Self-Service (ESS) portal for **EaseMyExpo**. Employees mark attendance,
apply for leave, and view their profile, salary, and balances. Admins manage
employees, attendance, leave approvals, leave balances, holidays, and payroll.

Built with **Next.js 14 (App Router)**, **MongoDB + Mongoose**, **NextAuth.js v5**,
and **Tailwind CSS**.

---

## Tech stack

| Layer            | Choice                                  |
| ---------------- | --------------------------------------- |
| Framework        | Next.js 14.2 (App Router, RSC)          |
| Auth             | NextAuth.js v5 (Credentials + JWT)      |
| Database         | MongoDB (existing company cluster)      |
| ODM              | Mongoose 8                              |
| Password hashing | bcryptjs (cost 10)                      |
| Validation       | zod                                     |
| Styling          | Tailwind CSS + CSS design tokens        |
| Frontend host    | Vercel                                  |
| Backend/API host | Railway                                 |

---

## Prerequisites

- **Node.js >= 18.18** and npm
- A **MongoDB connection string** (your existing company cluster / Atlas)

---

## 1. Local setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env.local
```

Open `.env.local` and fill in the two required values:

```ini
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/eme_people?retryWrites=true&w=majority
NEXTAUTH_SECRET=        # generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

> Generate a secret: `openssl rand -base64 32`

### 2. Seed the database (clean install)

Wipes all portal collections and creates a **single administrator account**. No
demo employees or data are created — add real employees through the admin UI.

```bash
npm run seed
```

**Admin login** (username / password):

| Role  | Username | Password   |
| ----- | -------- | ---------- |
| Admin | `admin`  | `admin123` |

> ⚠️ `npm run seed` **wipes** all portal collections. Never run it against a
> database that holds real data you want to keep.

### 3. Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000> and log in as `admin / admin123`.

---

## Available scripts

| Command             | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the dev server (hot reload)        |
| `npm run build`     | Production build                         |
| `npm run start`     | Run the production build                 |
| `npm run lint`      | ESLint                                   |
| `npm run typecheck` | TypeScript type-check (no emit)          |
| `npm run seed`      | Seed the database with demo data         |

---

## Environment variables

| Variable          | Required        | Description                                                        |
| ----------------- | --------------- | ------------------------------------------------------------------ |
| `MONGODB_URI`     | ✅ always        | MongoDB connection string for the company cluster.                 |
| `NEXTAUTH_SECRET` | ✅ always        | Secret used to sign/encrypt session JWTs. `openssl rand -base64 32`. |
| `NEXTAUTH_URL`    | ✅ in production | Canonical app URL. `http://localhost:3000` locally; the deployed URL in prod. |
| `MONGODB_DB`      | optional        | DB name if not already part of `MONGODB_URI`. Defaults to `eme_people`. |

All secrets live in `.env*` files (gitignored) locally, or in the host's
environment-variable settings in production. **Never commit real values.**

---

## Deployment

The app is a standard Next.js App Router project and deploys as a single unit
(server components, server actions, and API routes run on the host's Node
runtime). Pick **one** of the two targets below.

### Option A — Vercel (frontend, same account as Leadline)

1. Push this repo to GitHub/GitLab.
2. In Vercel, **New Project → Import** the repository.
3. Framework preset: **Next.js** (auto-detected). No build overrides needed.
4. Under **Settings → Environment Variables**, add:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → your production URL, e.g. `https://eme-people.vercel.app`
5. **Deploy.** Vercel runs `next build` automatically.
6. (First deploy only) Seed the database once from your machine, pointing
   `.env.local`'s `MONGODB_URI` at the production cluster, then `npm run seed`.

### Option B — Railway (backend/API, same account as existing backend)

1. In Railway, **New Project → Deploy from GitHub repo**.
2. Railway detects Node/Next.js. Confirm:
   - Build command: `npm run build`
   - Start command: `npm run start`
3. Under **Variables**, add `MONGODB_URI`, `NEXTAUTH_SECRET`, and
   `NEXTAUTH_URL` (the Railway-provided public domain).
4. **Deploy.**

> Whichever host you choose, set `NEXTAUTH_URL` to the exact public URL —
> NextAuth uses it for auth callbacks.

---

## Architecture

```
src/
  app/
    (app)/                 # Authenticated app (shared shell)
      dashboard/           # Role-aware dashboard
      attendance/          # Employee attendance + calendar
      leave/               # Employee leave
      salary/              # Employee salary breakdown
      profile/             # Read-only employee profile
      admin/               # Admin-only (guarded by requireAdmin)
        employees/  attendance/  leave/  balances/  holidays/  payroll/
    actions/               # Server Actions (mutations, zod-validated)
    api/auth/[...nextauth] # NextAuth route handlers
    login/                 # Public login page
  components/              # Client + server UI components
  lib/                     # mongodb, session, dates, money, badges, constants
  models/                  # Mongoose models
  types/                   # Core types + serializable DTOs
scripts/seed.ts            # Demo-data seeder
```

**Key conventions**

- **Server Components** fetch data via `src/lib/data.ts`, which always returns
  plain **DTOs** (never Mongoose documents) so results are safe to pass to
  Client Components.
- **Mutations** go through **Server Actions** in `src/app/actions/*`, each
  zod-validated and gated by `requireUser` / `requireAdmin`.
- **Auth** is split: an edge-safe `auth.config.ts` (used by `middleware.ts`) and
  a full `auth.ts` (Credentials provider + bcrypt + DB, Node runtime only).
- The Mongoose connection is a **cached singleton** (`src/lib/mongodb.ts`) to
  survive serverless cold starts and dev hot-reloads.

---

## Business rules (ported from the approved prototype)

- **Weekly off:** every Sunday, plus the 2nd and 4th Saturday of the month.
- **Late check-in:** a same-day check-in at or after 10:00 is marked **Late**.
- **Working days** for leave exclude weekly-offs and public holidays.
- **Salary breakdown:** basic = 50% of gross, HRA = 20%, special = remainder;
  PF = 12% of basic, TDS = 8% of gross.
- **Leave types:** Earned (12), Sick (8) days per year.
```
