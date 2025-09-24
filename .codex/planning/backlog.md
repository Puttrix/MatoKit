# Product Backlog

Ordered list of upcoming work items. Update status as tasks advance and link to related docs or discussions.

| ID | Title | Milestone | Status | Notes |
|----|-------|-----------|--------|-------|
| BL-001 | SDK core `matomoGet` with query builder + zod parsing | M0 | Done | HTTP client + response schemas with validation |
| BL-002 | SDK `getKeyNumbers` implementation + types/tests | M1 | Done | Helper implemented with schema-backed parsing |
| BL-003 | SDK `getMostPopularUrls` (`flat=1`) + tests | M1 | Done | Helper implemented with limit + flat controls |
| BL-004 | SDK `getTopReferrers` + tests | M1 | Done | Helper implemented with segment + limit support |
| BL-005 | API Fastify project + routes for reporting tools | M1 | Done | Reporting/Discovery endpoints live with auth guard + cache headers |
| BL-006 | Discovery generation at `/.well-known/tools.json` | M1 | Done | Manifest includes JSON Schemas for tool inputs/outputs |
| BL-007 | Tracking `trackPageview` with queue/retry | M2 | Done | SDK tracking client with p-queue + Fastify endpoint |
| BL-008 | Tracking `trackEvent` and `trackGoal` | M2 | Done | Event/goal helpers exposed via `/track/*` routes |
| BL-009 | CI workflow (lint/test/typecheck/build) | M3 | Todo | Integrate with GitHub Actions |
| BL-010 | Docs: README quick start + examples folder | M3 | Todo | Reference API + SDK usage |
