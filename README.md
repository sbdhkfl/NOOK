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
| Deployment | Vercel (frontend), Supabase (backend) | Free tiers available, simple configuration |

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
├── vercel.json                # Vercel deployment config
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

## How to deploy it to Vercel

Vercel hosts the frontend for free. Supabase hosts the backend/database separately (also has a free tier).

1. Push your code to a GitHub repository.
2. Go to https://vercel.com and sign up.
3. Click **Add New → Project** and import your GitHub repo.
4. Vercel will detect Vite. Use these settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Install command:** `npm install`
5. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `VITE_APP_URL` = your Vercel domain (e.g. `https://your-app.vercel.app`)
6. Click **Deploy**.

Success: Vercel builds and deploys. You get a live URL.

**Important:** In your Supabase dashboard, go to **Authentication → URL Configuration** and add your Vercel domain to **Redirect URLs** (e.g. `https://your-app.vercel.app/*`) so authentication callbacks work.

---

## How to deploy it to Netlify if supported

Netlify is also supported. Create a `netlify.toml` if you want to use Netlify:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Then connect your GitHub repo to Netlify and add the same environment variables.

Note: This project is configured primarily for Vercel via `vercel.json`. Netlify works but requires the `netlify.toml` above.

---

## How to configure a domain

1. Buy a domain from any registrar.
2. In Vercel: go to your project → **Settings → Domains** → add your domain.
3. Follow Vercel's DNS instructions (add CNAME or A records at your registrar).
4. Vercel automatically provisions HTTPS.

---

## How to manage secrets safely

- Never commit `.env` to Git (it's in `.gitignore`).
- `.env.example` contains only placeholders — safe to commit.
- In production (Vercel), set secrets in the **Environment Variables** dashboard, not in code.
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

## Which services have free-tier limits

| Service | Free tier | Notes |
|---------|-----------|-------|
| Supabase | 500 MB database, 2 GB file storage, 1GB bandwidth, auth included | Not unlimited — monitor usage |
| Vercel | Hobby tier: free for personal use | Bandwidth limits apply |

---

## What might cost money

- Exceeding Supabase free-tier limits (database size, storage, bandwidth).
- Custom domain purchases (via registrar).
- Premium email/SMS providers if you integrate them later.
- Higher Vercel plans for team/commercial use.

---

## How to move from a prototype to production

1. Enable email confirmations in Supabase Auth settings.
2. Configure your production domain in Supabase redirect URLs.
3. Set up Supabase automatic backups.
4. Deploy to Vercel with production environment variables.
5. Monitor usage in Supabase dashboard to stay within free tier.
6. Consider a custom domain and HTTPS (automatic on Vercel).

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
