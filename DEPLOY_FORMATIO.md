# Deploying Formatio Quiver (OpenRouter + Supabase + Vercel)

Quiver is patched in `lib/ai/client.ts` and `app/api/settings/api-key-status/route.ts` so all AI sessions, onboarding, synthesis, and MCP workflows run through **OpenRouter** (`https://openrouter.ai/api`, default `anthropic/claude-sonnet-5.5`) without requiring a separate Anthropic console account.

## 1. Environment Variables (`.env.local` locally or Vercel Project Settings)

```bash
# Supabase Postgres + Auth
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# OpenRouter (replaces direct Anthropic billing)
OPENROUTER_API_KEY="sk-or-v1-..."
QUIVER_AI_MODEL="anthropic/claude-sonnet-5.5"

# App + Secrets (generate each via `openssl rand -base64 32`)
NEXT_PUBLIC_APP_URL="https://quiver.formatio.cloud"
QUIVER_SHARE_SECRET="..."
CRON_SECRET="..."
MCP_AUTH_SECRET="..."
```

## 2. Database Migration & Seed Formatio Context

```bash
cd /Users/mac/quiver
npm install
npx prisma migrate deploy
node scripts/seed-formatio-context.mjs
```

The seed script loads Formatio's live positioning ($200/month flat org rate), AI SRE fix PRs, Govern SSO, Qovery competitive positioning, H1-H4 hypotheses, and banned-slop voice constraints as active `ContextVersion` v1.

## 3. Connect Your Coding Agents to Quiver MCP

Point Claude Code or Cursor to `mcp/index.ts` (stdio) or `https://<your-quiver-url>/api/mcp` with `MCP_AUTH_SECRET` so your coding agents read and update the same GTM context ledger as `formatio-gtm/scripts/*`.
