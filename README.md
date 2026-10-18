# NOOK — Social Media & Messaging Platform

NOOK is a full-stack social media and messaging application. It lets users create accounts, post updates, follow each other, send direct and group messages, join communities, and receive notifications — all with persistent data stored in a real database.

This guide is written for beginners. Every step includes the exact command to run and what success looks like.

---

## What NOOK is

NOOK is an original social platform combining:

- **Social feed** — create, like, comment on, bookmark, and share posts.
- **Messaging** — one-to-one and group conversations with realtime delivery.
- **Communities** — public or private group spaces with roles and moderation.
- **Notifications** — in-app alerts for messages, likes, comments, follows, and more.
- **Profiles** — avatars, display names, usernames, bios, private/public accounts, following.
- **Settings & privacy** — theme, notification preferences, account deletion.

All data is stored persistently in PostgreSQL. There is **no hardcoded limit on the number of users**.

---

## Technology used and why

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + TypeScript + Vite | Modern, fast, widely supported, beginner-friendly |
| Styling | Tailwind CSS | Maintainable, responsive, dark mode built in |
| Backend / Database / Auth / Realtime / Storage | Supabase (managed PostgreSQL) | Gives database, authentication, realtime WebSockets, file storage, and row-level security out of the box — no custom server to maintain |
| Routing | React Router | Client-side navigation |
| State | Zustand | Lightweight state management |
| Forms | React Hook Form + Zod | Validation and easy form handling |
| Testing | Vitest + Testing Library | Unit, integration, and UI tests |
| Deployment | Any compatible hosting service | Build and deploy the frontend; configure the backend and environment variables separately |

Supabase was chosen because it bundles PostgreSQL, auth, realtime, and storage in one managed service with **database-level security policies (RLS)**. This means private data is protected by the database itself, not just by the frontend.

---

## Folder structure

```
NOOK/
├── README.md                  # This file
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript config
├── tsconfig.node.json         # TypeScript config for Vite
├── vite.config.ts             # Vite build config
├── tailwind.config.js         # Tailwind CSS config
├── postcss.config.js          # PostCSS config
├── index.html                 # Entry HTML
├── .env.example               # Environment variable placeholders (copy to .env)
├── .gitignore                 # Files ignored by Git
├── supabase/
│   ├── config.toml            # Supabase local dev config
│   └── migrations/
│       └── 01_initial_schema.sql   # Full database schema + RLS policies
├── src/
│   ├── main.tsx               # App entry point
│   ├── App.tsx                # Routing
│   ├── index.css              # Global styles + Tailwind
│   ├── lib/supabase.ts        # Supabase client
│   ├── types/database.ts      # TypeScript types for the database
│   ├── store/auth.ts          # Authentication state
│   ├── store/toast.ts         # Toast notification state
│   ├── utils/cn.ts            # Class name helper
│   ├── hooks/
│   │   ├── usePosts.ts        # Feed posts, reactions, comments
│   │   ├── useMessages.ts     # Conversations and messages
│   │   └── useSocial.ts       # Follow, community access, unread count
│   ├── components/ui/         # Base UI components (button, input, card, etc.)
│   ├── components/layout/     # Navbar, Sidebar, Layout
│   ├── pages/                 # All application pages
│   └── test/setup.ts          # Test setup
├── tests/
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration / authorization tests
└── docker-compose.yml         # Optional local development services
```

---

## Required software

Before you begin, install:

1. **Node.js** (version 18 or newer) — https://nodejs.org
2. **npm** (comes with Node.js)
3. **Git** — https://git-scm.com
4. A code editor — we recommend **VS Code** — https://code.visualstudio.com
5. A **Supabase account** (free) — https://supabase.com

To verify Node and npm are installed, open a terminal and run:

```bash
node --version
npm --version
```

You should see version numbers printed.

---

## How to open the project in VS Code

1. Download or clone this repository.
2. Open VS Code.
3. Choose **File → Open Folder...** and select the `NOOK` folder.
4. You should see the folder structure in the Explorer sidebar on the left.

---

## How to install dependencies

Open a terminal inside the `NOOK` folder (in VS Code: **Terminal → New Terminal**) and run:

```bash
npm install
```

Success: a `node_modules` folder and a `package-lock.json` file are created. No error messages.

---

## How to configure environment variables

NOOK needs your Supabase project credentials to connect to the database and authentication service.

1. Create a free project at https://supabase.com/dashboard.
2. In your Supabase dashboard, go to **Settings → API**.
3. Copy the **Project URL** and the **anon public** key.
4. In the `NOOK` folder, copy the example file:

```bash
cp .env.example .env
```

5. Open `.env` and replace the placeholder values:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:5173
```

Save the file. Never share `.env` or commit it to Git — it is listed in `.gitignore`.

---

## How to create and configure required external accounts

### Supabase (required)

1. Go to https://supabase.com and sign up.
2. Create a new project. Choose a region close to you.
3. Wait for the project to be ready (Supabase will show a spinner).
4. Go to **Settings → API** and copy the Project URL and anon key into your `.env`.
5. Go to **SQL Editor** and paste the contents of `supabase/migrations/01_initial_schema.sql`, then click **Run**. This creates all tables and security policies.

Success: You can see tables listed under **Table Editor** in the Supabase dashboard (profiles, posts, messages, etc.).

### Email provider (optional, for password reset / email verification)

Supabase handles email templates. For password reset emails to work in production, configure **Settings → Authentication → Email** with your own SMTP settings or use Supabase's default (fine for development/testing).

---

## How to configure the database and authentication

1. Run the migration (see above) — either through the Supabase SQL Editor or locally with the Supabase CLI:
   ```bash
   npx supabase db push
   ```
   (Requires the Supabase CLI: `npm install supabase --save-dev` then `npx supabase login`.)

2. Authentication is handled by Supabase Auth. The schema creates a `profiles` row automatically when a user signs up (handled in the registration page code).

3. Row Level Security (RLS) is enabled on every table in `01_initial_schema.sql`. This means the database itself rejects any request a user is not authorized to make — even if someone bypasses the frontend.

---

## How to run database migrations

The schema is in `supabase/migrations/01_initial_schema.sql`.

**Option A — Supabase Dashboard (easiest):**
1. Open your Supabase project → **SQL Editor**.
2. Paste the entire file contents.
3. Click **Run**.

**Option B — Supabase CLI:**
```bash
npm install --save-dev supabase
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

Success: No SQL errors. New tables appear in **Table Editor**.

---

## How to start the app locally

1. Make sure you installed dependencies (`npm install`).
2. Make sure `.env` is configured with your Supabase URL and anon key.
3. Run:

```bash
npm run dev
```

4. Open the URL shown in the terminal (usually `http://localhost:5173`).
5. You should see the NOOK landing page. Click **Get started** or **Log in** to create an account and use the app.

Success: The app loads, you can register, log in, create a post, and see it in the feed.

---

## How to test it

Run the test suite:

```bash
npm test
```

Success: All tests pass. You should see a summary like `Test Files 3 passed, 3 passed`.

Tests include:
- Unit tests for utilities and the mocked Supabase client.
- Integration tests verifying authorization rules (users can't read private conversations they aren't in, can't edit others' posts, etc.).

---

## How to build it for production

```bash
npm run build
```

Success: A `dist` folder is created with optimized static files. No build errors.

To preview the production build locally:

```bash
npm run preview
```

---

## How to deploy NOOK using VS Code

You can deploy NOOK to any hosting service that supports a Vite/React frontend. The exact button names vary by provider, but the overall process is similar.

### 1. Prepare the project

1. Open the `NOOK` folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure your production backend and environment variables. Follow the backend setup instructions earlier in this README.
5. Test the production build:

   ```bash
   npm run build
   ```

   Continue only after the build completes successfully. The compiled frontend files will be in the `dist` folder.

### 2. Choose a compatible hosting service

Choose a hosting service that supports static frontend builds and lets you configure environment variables. In its project setup, use these settings where the service asks for them:

- **Project folder:** the root `NOOK` folder.
- **Install command:** `npm install`
- **Build command:** `npm run build`
- **Published/output folder:** `dist`
- **Runtime:** use a supported current Node.js version for the build.

If the service connects to a Git repository, select the repository containing NOOK and its default branch. If it accepts a manual upload instead, upload the contents of `dist` after a successful production build. Git-based deployment is usually easier to maintain because future updates can be deployed from new commits.

### 3. Add production environment variables

In the hosting service's project settings, add the required frontend environment variables using the values for your production backend:

```text
VITE_SUPABASE_URL=your-production-project-url
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_APP_URL=https://your-deployed-app-address
```

Replace the example values with your actual configuration. Do not put private service-role keys, passwords, or other server secrets into frontend variables. Variables prefixed with `VITE_` are included in the browser build and must not contain secrets.

If you change environment variables, trigger a new build and deployment.

### 4. Configure backend access

In your backend's authentication settings, add the deployed app's address to the allowed site and redirect URL settings. Configure storage permissions, database policies, and any required email settings for production.

The frontend and backend are separate parts of NOOK. Deploying the frontend does not automatically create or deploy the database, authentication, storage, or realtime services.

### 5. Verify the live application

After deployment finishes:

1. Open the live address provided by your hosting service.
2. Register and sign in with a test account.
3. Test creating a post, editing your own content, and sending messages.
4. Confirm private content is not visible to unauthorized accounts.
5. Check the browser developer console and the hosting logs for errors.
6. Verify password reset and email verification if enabled.
7. Test on both desktop and mobile.

If something fails, compare the production environment variables with your local configuration, check backend redirect settings, review deployment logs, and rebuild after making corrections.

### 6. Update NOOK later

1. Open the project in VS Code.
2. Make and test your changes.
3. Run `npm run build`.
4. Commit and push changes if using Git-based deployment, or rebuild and upload the new `dist` files if using manual deployment.
5. Confirm the updated application works at its live address.

### Deployment notes

- A static frontend host does not replace a database or backend.
- The chosen service may have bandwidth, build, storage, execution, or usage quotas.
- A custom domain is optional; follow the domain setup instructions supplied by your chosen provider.
- Do not enable paid plans or incur charges without reviewing the pricing and getting the account owner's approval.
- Keep a backup of the database and document how to restore it before handling real users' data.

---

## How to manage secrets safely

- Never commit `.env` to Git (it's in `.gitignore`).
- `.env.example` contains only placeholders — safe to commit.
- In production, set frontend configuration in your hosting service's environment-variable settings, not in source code.
- Never put the Supabase service_role key in the frontend. Only the `anon` key goes in `.env` (it's safe because RLS protects data).

---

## How to back up and restore data

Your data lives in Supabase PostgreSQL.

**Backup:**
- In Supabase dashboard → **Settings → Database** → scroll to **Backups** to enable automatic daily backups (free tier includes backups).
- Or manually: `pg_dump` your database using the connection string from **Settings → Database**.

**Restore:**
- In Supabase dashboard → **Backups** → restore from a previous backup.
- Or pipe a `pg_dump` file back into your database.

---

## How to troubleshoot common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing Supabase environment variables` | `.env` not created or values empty | Copy `.env.example` to `.env` and fill in values, then restart dev server |
| `Invalid API key` | Wrong anon key | Copy the correct key from Supabase Settings → API |
| `403 / permission denied` on posts/messages | RLS policy blocking | Check you're logged in; RLS enforces ownership/membership |
| User not redirected after login | Auth state not synced | Refresh the page; check `VITE_APP_URL` matches your dev/prod domain |
| Build fails | TypeScript errors | Run `npm run lint` and fix errors; ensure `node_modules` is installed |

---

## How to update dependencies safely

```bash
npm update
npm run build
npm test
```

If something breaks, check the changelog of the updated package and revert in `package.json` if needed.

---

## How to scale the application

NOOK is designed to scale without a rewrite:

- **Database:** Supabase PostgreSQL scales vertically. Add indexes (already in schema) for frequently queried columns.
- **Pagination:** All feed and message queries are bounded with `.limit()` and cursors — no full table scans.
- **Caching:** Browser caching + SWR-style refetch on focus can be added later.
- **Realtime:** Supabase Realtime handles WebSocket connections. For very high traffic, upgrade your Supabase plan.
- **Storage:** Avatars and media use Supabase Storage. Upgrade plan for more bandwidth/storage.
- **Rate limiting:** Supabase Auth has built-in rate limiting. Additional rate limits can be added via Edge Functions.

Likely bottlenecks: realtime connections, file storage bandwidth, write-heavy tables (messages, reactions). Upgrade path: higher Supabase tier, then read replicas or sharding if needed.

---

## Hosting limits and costs

Hosting and backend providers have different limits for compute, bandwidth, database size, storage, realtime connections, and build minutes. Review the current limits and pricing for the services you choose; do not assume any service is unlimited or permanently free.

Costs may include database usage, file storage, bandwidth, custom domains, email delivery, and higher hosting capacity. Do not enable paid services without approval.

---

## How to move from a prototype to production

1. Enable and test email confirmation and password reset.
2. Configure the production app address in the backend authentication redirect settings.
3. Set up and test database backups and restoration.
4. Configure production environment variables in the hosting service.
5. Monitor database, storage, bandwidth, and realtime usage.
6. Test authentication, privacy rules, uploads, and messaging before inviting real users.

---

## How to delete or export user data appropriately

- **Account deletion:** In Settings → Danger zone → Delete account. This removes the auth user. Related data (posts, messages, etc.) is removed via database `on delete cascade` rules in the schema.
- **Data export:** Request data via the Supabase dashboard or query your tables directly. There is no built-in "export my data" button yet — this is a documented future improvement.
- **Blocking/reporting:** Users can block others and report content from profiles and messages. Reports are stored in the `reports` table for moderator review.

---

## License and project attribution

NOOK is licensed under the **GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**. Read the full terms in [LICENSE](./LICENSE).

This copyleft license allows people to use, study, modify, and redistribute NOOK under its terms. If someone modifies NOOK and lets people use that modified version over a network, the AGPL generally requires them to offer those users the corresponding source code.

**Attribution and forks:** Keep the original copyright and license notices. If you publish a modified version, clearly identify it as a fork or modified version and identify its maintainers; do not present it as the official upstream NOOK project. The NOOK name and logo are not granted for branding or endorsement by the software license.

Open source licensing cannot guarantee that nobody will falsely claim authorship or ownership. It does provide license conditions and preserved notices that help establish provenance. Names and logos may need separate trademark protection; this repository does not claim that a trademark has been registered.


---

## Support

If you're stuck:
1. Check the Troubleshooting table above.
2. Verify your `.env` values match Supabase Settings → API.
3. Check the browser console for errors.
4. Confirm you ran the database migration.
