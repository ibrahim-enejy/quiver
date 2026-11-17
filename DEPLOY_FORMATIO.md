# Deploying Formatio Quiver on Formatio (Railpack + Supabase + OpenRouter)

Quiver is patched (`lib/ai/client.ts`, `app/api/settings/api-key-status/route.ts`) to run all AI sessions, onboarding, research synthesis, and MCP tools via **OpenRouter** (`https://openrouter.ai/api`, default `anthropic/claude-sonnet-5.5`), and includes an idempotent Formatio boot script (`scripts/start-formatio.sh`).

---

## 1. Where to Find Every Supabase Environment Variable

Open your project in **Supabase Dashboard**:

1. **API URL & Keys** → **Project Settings (`⚙️`) → API** (or **Data API** / **API Keys**):
   - `NEXT_PUBLIC_SUPABASE_URL` = **Project URL** (`https://<project-ref>.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = **`anon` / `public`** key
   - `SUPABASE_SERVICE_ROLE_KEY` = **`service_role`** secret key *(server-side only)*

2. **Postgres Strings** → Click **Connect** in the top bar → select **Connection String / ORMs (Prisma)**:
   - `DATABASE_URL` = **Transaction pooler** URI (`aws-0-...pooler.supabase.com:6543/...?pgbouncer=true`) with your database password
   - `DIRECT_URL` = **Session pooler** URI (`aws-0-...pooler.supabase.com:5432/...`) — *Tip: use the **Session pooler** instead of Direct (`db.<ref>.supabase.co`) if your Formatio server uses IPv4-only Docker networking, since Supabase Direct connections default to IPv6.*

3. **OpenRouter & Quiver App Secrets**:
   - `OPENROUTER_API_KEY` = your `sk-or-v1-...` key
   - `QUIVER_AI_MODEL` = `anthropic/claude-sonnet-5.5`
   - `NEXT_PUBLIC_APP_URL` = your HTTPS Quiver URL (e.g. `https://quiver.formatio.cloud` or your Formatio platform subdomain)
   - Generate 3 random secrets locally (`openssl rand -base64 32`):
     - `QUIVER_SHARE_SECRET`
     - `CRON_SECRET`
     - `MCP_AUTH_SECRET`

---

## 2. Configure Formatio Application

1. Push this repo to `git@github.com:ibrahim-enejy/quiver.git` (`git push -u fork main`).
2. In **Formatio Dashboard**:
   - **Source:** `ibrahim-enejy/quiver` (`main` branch)
   - **Builder:** **Railpack** *(default)*
   - **Start Command:** `sh scripts/start-formatio.sh` *(automatically runs `prisma migrate deploy`, seeds Formatio `ContextVersion` v1 idempotently, and binds Next.js to `0.0.0.0:3000`)*
   - **Environment tab:** Paste the 11 variables above (**Save**, then **Deploy** — Railpack exposes `NEXT_PUBLIC_*` during build AND injects all runtime secrets cleanly).
   - **Networking tab:** Add your domain / platform subdomain routing **HTTP** → port **`3000`**.
3. In **Supabase Dashboard → Authentication → URL Configuration**:
   - Set **Site URL** to your Quiver HTTPS URL.
   - Add `https://<your-quiver-domain>/**` under **Redirect URLs**.
4. Open `https://<your-quiver-domain>/login`, click **Create the first account** (first user becomes Admin), and your pre-seeded Formatio context is immediately active!
