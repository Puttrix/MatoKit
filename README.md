# Matomo LLM Tooling

SDK and Opal-compatible tool API that make Matomo analytics accessible to LLM agents, covering both reporting (read) and tracking (write) workflows.

## Current Focus
- Build a typed TypeScript SDK for Matomo Reporting and Tracking APIs.
- Expose friendly HTTP endpoints ("tools") via Fastify with Opal discovery metadata.
- Deliver helper utilities for date ranges, segmentation, caching, and retries.

## Quick Start
1. Set environment variables:
   - `MATOMO_BASE_URL`
   - `MATOMO_TOKEN`
   - `DEFAULT_SITE_ID` (optional, used when tool payload omits `siteId`)
   - `OPAL_BEARER_TOKEN` (required for bearer auth)
2. Run the API service (workspace root):
   ```bash
   pnpm install
   pnpm --filter @matokit/api dev
   ```
3. Fetch the discovery manifest:
   ```bash
   curl -H "Authorization: Bearer $OPAL_BEARER_TOKEN" http://localhost:3000/.well-known/tools.json | jq
   ```

## Docker Deployment
1. Build the container locally:
   ```bash
   docker build -t matokit-api .
   ```
2. Run with the required environment variables (replace with your values):
   ```bash
   docker run --rm -p 3000:3000 \
     -e MATOMO_BASE_URL=https://analytics.example.com \
     -e MATOMO_TOKEN=your-matomo-token \
     -e OPAL_BEARER_TOKEN=change-me \
     -e PORT=3000 -e HOST=0.0.0.0 \
     matokit-api
   ```
3. For a longer-lived setup, copy `docker-compose.example.yml` to your stack, configure the env vars (or point to an `.env` file), and run:
   ```bash
   docker compose -f docker-compose.example.yml up --build -d
   ```
   Check logs with `docker compose logs -f matokit-api` and hit `http://localhost:3000/health` or `/discovery` to verify.
4. Place the container behind your reverse proxy (Traefik, Caddy, Nginx, etc.) so `https://<your-domain>/discovery` is publicly reachable for Opal.

### Portainer Stack Deployment
1. In Portainer, go to **Stacks → Add Stack** and give it a name such as `matokit-api`.
2. Copy the contents of `docker-compose.example.yml` into the stack editor and adjust the environment variables to match your Matomo instance (or reference an `.env` file via `env_file` if you prefer).
3. Deploy the stack. After it starts, open the stack details and tail the service logs to confirm Fastify reports `listening on 0.0.0.0:3000`.
4. From another terminal, run `curl http://<host>:3000/health` (or `/discovery`) to verify the service is reachable before exposing it through your reverse proxy.

## Workflow Notes
- Maintain planning artifacts in `.codex/planning` and long-lived context in `.codex/memory`.
- **Whenever a task or milestone is completed, update this README with the latest status or achievements.**
- Keep newest updates at the top of the Recent Updates section.

## Reporting Examples
```bash
curl -s \
  -H "Authorization: Bearer $OPAL_BEARER_TOKEN" \
  http://localhost:3000/tools/GetKeyNumbers \
  -H "Content-Type: application/json" \
  -d '{"period":"week","date":"last7"}' | jq
```
```ts
import { ReportingService, createMatomoClient } from '@matokit/sdk';

const client = createMatomoClient({
  baseUrl: process.env.MATOMO_BASE_URL!,
  tokenAuth: process.env.MATOMO_TOKEN!,
});

const reporting = new ReportingService(client, { ttlMs: 60_000 });

const urls = await reporting.getMostPopularUrls({
  siteId: 1,
  period: 'day',
  date: 'yesterday',
  limit: 5,
});

console.log({
  cacheHit: urls.cache.hit,
  ttl: urls.cache.ttl,
  rows: urls.data,
});
```

API responses also include caching and pagination hints via headers: `X-Cache-Hit`, `X-Cache-TTL`, `X-Pagination-Limit`, and `X-Pagination-Page`.

## Tracking Examples
```bash
curl -s \
  -H "Authorization: Bearer $OPAL_BEARER_TOKEN" \
  http://localhost:3000/track/Pageview \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/checkout","title":"Checkout"}'
```
```ts
import { MatomoTrackingClient } from '@matokit/sdk';

const tracking = new MatomoTrackingClient({
  baseUrl: process.env.MATOMO_BASE_URL!,
  tokenAuth: process.env.MATOMO_TOKEN!,
  defaultSiteId: 1,
});

await tracking.trackEvent({
  category: 'checkout',
  action: 'complete',
  value: 49.99,
});
```

More detailed snippets live in `docs/tools.md`.

## Recent Updates
- 2024-03-17: Added caching + pagination metadata for reporting tools (headers + SDK cache).
- 2024-03-17: Added tracking SDK helpers with queued retries and `/track/*` endpoints guarded by bearer auth.
- 2024-03-17: Discovery manifest now serves JSON Schemas for all reporting tools, aligned with API validators.
- 2024-03-17: Added reporting SDK helpers and Fastify tool routes with discovery manifest + bearer auth guard.
- 2024-03-17: Fastify API bootstrap added with env validation, security middleware, and `/health` check.
- 2024-03-17: Shipped zod-based reporting schemas and wired schema parsing into the Matomo client.
- 2024-03-17: Tuned ESLint ignore patterns so `pnpm lint` ignores compiled `dist` artifacts.
- 2024-03-17: Implemented core Matomo HTTP client (`createMatomoClient`) with query builder, timeout handling, and unit tests.
- 2024-03-17: Added shared dev tooling (TypeScript, Vitest, ESLint, Prettier) and aligned workspace scripts across packages.
- 2024-03-17: Initialized pnpm workspace and scaffolded `packages/sdk` + `packages/api` with baseline TypeScript configs.

## CI
- Continuous integration runs lint, test, and typecheck via GitHub Actions (`.github/workflows/ci.yml`).
