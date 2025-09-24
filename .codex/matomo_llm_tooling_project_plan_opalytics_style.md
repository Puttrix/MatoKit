# Project Overview
Build an SDK + lightweight “tool” API that makes Matomo analytics and tracking LLM-friendly. Inspired by CodeArt’s Opalytics post, but targeting Matomo’s Reporting API (read) and HTTP Tracking API (write).

---

## Goals & Non‑Goals
**Goals**
- Provide a small, typed SDK with friendly methods (e.g., `getMostPopularUrls`, `getKeyNumbers`, `getTopReferrers`).
- Expose those methods as HTTP endpoints ("tools") with machine-readable discovery metadata for LLMs.
- Support both **read** (Reporting API) and **write** (Tracking API) with idempotent, retry-safe helpers.
- Include date/segment conveniences and sane defaults so users can ask for “last_7_days”, “this_month”, etc.

**Non‑Goals (MVP)**
- Full Matomo UI parity or dashboards.
- Complex auth brokers (stick to `token_auth`).
- Multi-tenant billing/quotas.

---

## Users & Use Cases
- **Analysts / SEO / Content**: Ask natural questions via LLM, get JSON answers: top pages, referrers, events.
- **Developers**: Server-side or GTM-SS to send events via a small helper, ensuring pv_id continuity.
- **Ops**: Schedule daily/weekly summaries (later phase).

---

## High-Level Architecture
- **SDK (TypeScript first; optional C# later)**
  - Reporting client → builds URLs for `module=API` with `method`, `idSite`, `period`, `date`, `token_auth`.
  - Tracking client → posts to Tracking HTTP API; queue + retry; ordered delivery.
  - Helpers → date range parsing, segmentation, pagination.
- **Tool API (HTTP) — *Opal-compatible***
  - Fastify service that wraps SDK methods into clean endpoints.
  - **Discovery endpoint** at `/discovery` returning an **Opal Tool Manifest** (schema describes the service & tools). (Per Opal core concepts.)
  - Optionally also serve a static OpenAPI for humans.
  - Auth: **Bearer token** on requests from Opal → validate on every call.
- **Storage**
  - No DB for MVP. In-memory cache (LRU) for GET reports. Optional Redis later.
- **Config**
  - Environment variables for `MATOMO_BASE_URL`, `MATOMO_TOKEN`, default `SITE_ID`, cache TTLs.
  - `OPAL_BEARER_TOKEN` for incoming requests from Opal.

---

## Tech Stack
- **Runtime**: Node 20+.
- **Web framework**: Fastify.
- **Type system**: TypeScript.
- **HTTP**: undici/fetch; zod for runtime validation.
- **Testing**: Vitest + nock.
- **Lint/format**: ESLint + Prettier.
- **Docs**: Docusaurus (later) or README + OpenAPI.
- **CI**: GitHub Actions (lint, test, typecheck, build, release).

---

## API Surfaces (MVP)
### SDK — Reporting
- `getMostPopularUrls({ siteId, date, period, limit, flat=true, segment })`
- `getKeyNumbers({ siteId, period, date })`
- `getTopReferrers({ siteId, date, period, limit })`
- `getEvents({ siteId, date, period, category?, action?, name?, limit })`

### SDK — Tracking
- `trackPageview({ url, title, siteId, uid?, pv_id?, ts? })`
- `trackEvent({ category, action, name?, value?, siteId, uid?, pv_id?, ts? })`
- `trackGoal({ idGoal, revenue?, siteId, uid?, pv_id?, ts? })`

### Tool API (HTTP endpoints) — Opal-compatible
- `POST /tools/GetMostPopularUrls`
- `POST /tools/GetKeyNumbers`
- `POST /tools/GetTopReferrers`
- `POST /tools/GetEvents`
- `POST /track/Pageview | /track/Event | /track/Goal`
- `GET  /discovery` → **Opal Tool Manifest** (see below)

**Security**
- All tool endpoints **require** `Authorization: Bearer <OPAL_BEARER_TOKEN>`.
- Reject if missing/invalid; include `WWW-Authenticate` hint.

---

## Opal Tool Manifest (example, trimmed)
```json
{
  "schemaVersion": "1",
  "service": {
    "name": "MatomoTools",
    "description": "LLM-callable endpoints for Matomo analytics",
    "version": "0.1.0"
  },
  "auth": { "type": "bearer" },
  "tools": [
    {
      "name": "GetMostPopularUrls",
      "method": "POST",
      "path": "/tools/GetMostPopularUrls",
      "inputSchema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "required": ["siteId","period","date"],
        "properties": {
          "siteId": {"type":"integer","minimum":1},
          "period": {"type":"string","enum":["day","week","month","year","range"]},
          "date": {"type":"string","description":"YYYY-MM-DD or range expressions"},
          "limit": {"type":"integer","default":10,"minimum":1,"maximum":1000},
          "segment": {"type":"string"}
        }
      },
      "outputSchema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "url": {"type":"string"},
            "label": {"type":"string"},
            "nb_visits": {"type":"integer"},
            "nb_hits": {"type":"integer"},
            "sum_time_spent": {"type":"integer"}
          },
          "required": ["label","nb_hits"]
        }
      }
    }
  ]
}
```
```json
{
  "schemaVersion": "1",
  "name": "MatomoTools",
  "description": "LLM-callable endpoints for Matomo analytics",
  "tools": [
    {
      "name": "GetMostPopularUrls",
      "method": "POST",
      "path": "/tools/GetMostPopularUrls",
      "params": {
        "siteId": {"type":"number","required":true},
        "period": {"type":"string","enum":["day","week","month","year","range"],"required":true},
        "date": {"type":"string","required":true},
        "limit": {"type":"number","default":10},
        "segment": {"type":"string","required":false}
      }
    }
  ]
}
```

---

## Data Models & Types (partial)
```ts
export type Period = "day" | "week" | "month" | "year" | "range";
export interface Range { from: string; to: string; }
export interface KeyNumbers { sessions: number; users: number; pageviews: number; bounceRate?: number; avgTimeOnSite?: number; }
export interface PopularUrlRow { url: string; label: string; nb_visits: number; nb_hits: number; sum_time_spent: number; }
```

---

## Config & Secrets
- `MATOMO_BASE_URL` (e.g., `https://analytics.example.com`)
- `MATOMO_TOKEN` (Matomo `token_auth`)
- `DEFAULT_SITE_ID` (optional)
- `CACHE_TTL_S` (default 60)
- `MAX_FILTER_LIMIT` (default 100)
- `API_KEY` *(optional, for non-Opal callers)*
- `OPAL_BEARER_TOKEN` *(required: Opal→tool auth)*

Store with dotenv locally; GitHub Actions: encrypted repo secrets.
- Uniform error shape: `{ error: { code, message, details? } }`.
- Map Matomo HTTP errors to typed errors (AuthError, RateLimitError, BadRequestError).
- Add `x-archiving-warning` header when Matomo caps results.
- Structured logs (pino) with request ids.

---

## Caching & Pagination
- Cache GET-like report calls keyed by (method, siteId, period, date, segment, limit) for `CACHE_TTL_S`.
- Expose `page` and `filter_limit`; surface `estimatedTotal` if computable; warn about server-side caps.

---

## Security & Compliance
- Never log `token_auth` or full URLs with tokens.
- Optional API key or JWT for Tool API.
- PII guard: opt-in hashing for `uid` and pruning of fields.
- CORS: allowlist origins for Tool API.

---

## Testing Strategy
- Unit tests for URL builder and parsers (nock fixtures).
- Contract tests for endpoints (zod schemas).
- Golden-file snapshots for discovery JSON.
- Mock clock for time-based helpers.
- **Opal integration tests**: run manifest validation and a sample tool-call using the Opal Tools SDK test harness.

---

## Documentation
- README: quick start (env, run, first call), examples, troubleshooting.
- API reference via OpenAPI or typed JSDoc + Redocly.
- Recipes: "Top pages last 7 days", "Track server-side events", "GTM-SS adapter".

---

## Repo Structure
```
matomo-tools/
  packages/
    sdk/          # TS SDK (reporting + tracking)
    api/          # Fastify service exposing tools
    examples/     # Sample scripts and Postman collection
  .github/workflows/ci.yml
  README.md
  LICENSE
```

---

## Milestones & Acceptance Criteria
**M0 – Scaffolding (Day 1–2)**
- Monorepo with tsconfig, eslint, vitest set up.
- SDK skeleton with fetch wrapper + URL builder.
- API skeleton with Fastify and health check.

**M1 – Read MVP (Days 3–5)**
- Implement `getKeyNumbers`, `getMostPopularUrls`, `getTopReferrers`.
- Endpoints for the three tools; Discovery document served.
- Tests + example scripts return real JSON against a test Matomo.

**M2 – Write MVP (Days 6–8)**
- Implement `trackPageview`, `trackEvent`, `trackGoal` with queue + retry.
- `/track/*` endpoints; ordering and pv_id continuity ensured.

**M3 – Quality & Docs (Days 9–10)**
- Caching, pagination params, archiving warnings.
- README and quick-start; CI green.

---

## Risks & Mitigations
- **Matomo caps / archiving** → return warnings and docs; advise server config if needed.
- **Token leakage** → strict logging policy; secrets scanning; never echo tokens.
- **Segment query complexity** → helper to validate/escape; documented examples.
- **LLM hallucinations** → Discovery doc + strict zod validation on inputs.

---

## Issue Backlog (initial)
1. SDK: implement core `matomoGet()` with query builder and zod parsing.
2. SDK: `getKeyNumbers` + types + tests.
3. SDK: `getMostPopularUrls` (+ `flat=1`) + tests.
4. SDK: `getTopReferrers` + tests.
5. API: Fastify project + routes for the three tools.
6. API: `/.well-known/tools.json` generation from a single source-of-truth registry.
7. Tracking: `trackPageview` with queue/retry and pv_id persistence.
8. Tracking: `trackEvent` and `trackGoal`.
9. Infra: CI workflow (lint/test/build); Node 20 matrix.
10. Docs: README quick start; examples folder with curl/Node snippets.

---

## Next Actions (You can do these now)
- Confirm runtime (TypeScript) and hosting preference (Heroku/Fly/Render/VPS).
- Provide a Matomo **test instance** (base URL, `token_auth`, and a dummy `idSite`).
- I’ll scaffold the repo and push M0 + M1 tasks.

---

## Stretch (Post-MVP)
- Redis cache; rate limiting; OpenAPI spec; scheduled digests; dashboard starter; GTM-SS adapter; C#/.NET SDK port.

