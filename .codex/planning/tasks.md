# Execution Tasks

Short-term tasks suitable for the current working session. Move completed items to the Done section and escalate larger efforts into the backlog.

## Now
- Produce developer docs snippets for tracking queue configuration and retries.

## Next
- Plan instrumentation/metrics for tracking queue throughput and error monitoring.
- Outline caching invalidation strategy for long-running workers.

## Blocked
- Obtain Matomo test instance credentials (base URL, token, site ID) for integration testing.

## Done
- [2024-03-17] Added caching + pagination metadata to reporting service and API headers.
- [2024-03-17] Added GitHub Actions CI workflow running lint/test/typecheck.
- [2024-03-17] Documented tool usage and provided reporting/tracking examples in README and docs.
- [2024-03-17] Implemented tracking queue with SDK helpers and Fastify `/track/*` endpoints.
- [2024-03-17] Enriched discovery manifest with JSON Schemas and aligned reporting routes with shared validators.
- [2024-03-17] Added reporting SDK helpers (`getKeyNumbers`, `getMostPopularUrls`, `getTopReferrers`, `getEvents`) with tests.
- [2024-03-17] Wired Fastify server bootstrap with env validation, reporting routes, and discovery manifest.
- [2024-03-17] Added zod response schemas and integrated schema validation into the Matomo client.
- [2024-03-17] Implemented shared Matomo HTTP client with timeout handling and tests.
- [2024-03-17] Added workspace dev dependencies, shared lint/test/format tooling, and updated package scripts.
- [2024-03-17] Selected pnpm as the package manager and logged the decision.
- [2024-03-17] Scaffolded `packages/sdk` and `packages/api` with baseline TypeScript configs.
