# Product Roadmap

High-level view of how the Matomo LLM tooling project progresses from scaffolding to a production-ready tool API.

## Milestones
### M0 – Scaffolding (Target: Days 1–2)
- Monorepo initialized with shared tooling (TypeScript, ESLint, Vitest, Prettier).
- SDK package skeleton with HTTP wrapper and configuration plumbing.
- API package skeleton with Fastify instance and health check.

### M1 – Read MVP (Target: Days 3–5)
- Implement read-side SDK methods: `getKeyNumbers`, `getMostPopularUrls`, `getTopReferrers`.
- Expose corresponding `/tools/*` endpoints with Opal-compliant discovery manifest.
- Automated tests (unit + contract) running locally and in CI.

### M2 – Write MVP (Target: Days 6–8)
- Tracking helpers for `trackPageview`, `trackEvent`, `trackGoal` with retry-safe queue.
- `/track/*` endpoints enforcing ordering, pv_id continuity, and auth.
- Integration tests simulating typical tracking flows.

### M3 – Quality & Docs (Target: Days 9–10)
- Caching, pagination, and archiving warnings surfaced consistently.
- Documentation pass (README quick start, API reference, examples folder).
- CI pipeline green across lint, test, typecheck, and build.

## Key Deliverables
- Typed SDK for Matomo Reporting & Tracking APIs with helper utilities.
- Fastify-based tool service exposing Opal-compatible endpoints and discovery manifest.
- Automated testing suite covering SDK units, HTTP contracts, and manifest validation.
- Documentation set including usage guides, examples, and operational notes.
