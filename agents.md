# AGENTS.md – EnviroPlot

## How to install
pnpm install

## How to run locally
pnpm --filter apps/backend dev  # API on :5000
pnpm --filter apps/frontend dev # Next on :3000

## How to run tests
pnpm --filter apps/backend test
pnpm --filter apps/frontend test

# === Backend configuration ===
PORT=5000
SUPABASE_URL=https://homnplhtmvdfxcqcjelr.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbW5wbGh0bXZkZnhjcWNqZWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTkyMDksImV4cCI6MjA1OTY3NTIwOX0.9G-DX3-KGB_ETJhSvivL7EKLJb9it0RG0AUY3ZL6IEs

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
MAPBOX_TOKEN=pk.your_mapbox_token_here

# === Frontend (NEXT_PUBLIC_*) ===
NEXT_PUBLIC_SUPABASE_URL=https://homnplhtmvdfxcqcjelr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbW5wbGh0bXZkZnhjcWNqZWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTkyMDksImV4cCI6MjA1OTY3NTIwOX0.9G-DX3-KGB_ETJhSvivL7EKLJb9it0RG0AUY3ZL6IEs
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api

## Coding conventions
- Use TypeScript strict mode.
- No comments in production code (per team style).
- Keep shared DTOs in `packages/shared-types`.

## Common tasks
- `parseEsdatBundle(...)` lives in `apps/backend/src/modules/esdat/`.
- Front-end pages use the new `/app` router in Next 15.