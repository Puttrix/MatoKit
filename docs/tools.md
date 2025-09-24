# Matomo Tools Service

This document collects quick-start instructions and examples for the reporting and tracking endpoints served by the Fastify API package.

## Authentication
- All requests require `Authorization: Bearer <OPAL_BEARER_TOKEN>` when the server sets `OPAL_BEARER_TOKEN`.
- If the token is omitted server-side, the API accepts unauthenticated calls (not recommended for production).

## Discovery
- `GET /.well-known/tools.json` and `GET /discovery` return the discovery manifest.
- Each tool entry includes JSON Schema fragments for both input and output payloads.

Example:
```bash
curl -s \
  -H "Authorization: Bearer $OPAL_BEARER_TOKEN" \
  https://api.example.com/.well-known/tools.json | jq '.tools[0]'
```

## Reporting Tools

### GetKeyNumbers
Request fields:
- `siteId` (optional): defaults to `DEFAULT_SITE_ID` env var.
- `period`: one of `day`, `week`, `month`, `year`, `range`.
- `date`: Matomo date expression (e.g. `today`, `2024-03-01`, `last7`).
- `segment` (optional): Matomo segment expression.

```bash
curl -s \
  -H "Authorization: Bearer $OPAL_BEARER_TOKEN" \
  https://api.example.com/tools/GetKeyNumbers \
  -H "Content-Type: application/json" \
  -d '{
    "period": "week",
    "date": "last7",
    "segment": "browserCode==FF"
  }'
```

### GetMostPopularUrls
Additional input:
- `limit` (optional, default 10, max 1000)
- `flat` (optional, defaults to `true`).
- `page` (optional, zero-based offset; combines with `limit`).

Response headers include:
- `X-Cache-Hit`: `1` for cached responses, `0` otherwise.
- `X-Cache-TTL`: remaining TTL in milliseconds.
- `X-Pagination-Limit` / `X-Pagination-Page`: pagination metadata when applicable.

```bash
curl -s \
  -H "Authorization: Bearer $OPAL_BEARER_TOKEN" \
  https://api.example.com/tools/GetMostPopularUrls \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": 3,
    "period": "day",
    "date": "yesterday",
    "limit": 5,
    "flat": false
  }'
```

### GetTopReferrers
```bash
curl -s \
  -H "Authorization: Bearer $OPAL_BEARER_TOKEN" \
  https://api.example.com/tools/GetTopReferrers \
  -H "Content-Type: application/json" \
  -d '{
    "period": "month",
    "date": "2024-03-01",
    "limit": 10
  }'
```

### GetEvents
```bash
curl -s \
  -H "Authorization: Bearer $OPAL_BEARER_TOKEN" \
  https://api.example.com/tools/GetEvents \
  -H "Content-Type: application/json" \
  -d '{
    "period": "week",
    "date": "last7",
    "category": "signup",
    "action": "click",
    "limit": 20
  }'
```

## Tracking Endpoints
All tracking endpoints respond with `202 { "status": "queued" }` upon successful enqueue.

### /track/Pageview
Required: `url`. Optional: `title`, `uid`, `pvId`, `ts` (unix ms or ISO string).
```bash
curl -s \
  -H "Authorization: Bearer $OPAL_BEARER_TOKEN" \
  https://api.example.com/track/Pageview \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/checkout",
    "title": "Checkout",
    "uid": "user_123",
    "pvId": "pv_456"
  }'
```

### /track/Event
```bash
curl -s \
  -H "Authorization: Bearer $OPAL_BEARER_TOKEN" \
  https://api.example.com/track/Event \
  -H "Content-Type: application/json" \
  -d '{
    "category": "checkout",
    "action": "complete",
    "value": 49.99
  }'
```

### /track/Goal
```bash
curl -s \
  -H "Authorization: Bearer $OPAL_BEARER_TOKEN" \
  https://api.example.com/track/Goal \
  -H "Content-Type: application/json" \
  -d '{
    "idGoal": 1,
    "revenue": 49.99
  }'
```

## SDK Usage (Reporting)
```ts
import {
  createMatomoClient,
  getMostPopularUrls,
  getKeyNumbers,
} from '@matokit/sdk';

const client = createMatomoClient({
  baseUrl: process.env.MATOMO_BASE_URL!,
  tokenAuth: process.env.MATOMO_TOKEN!,
});

const keyNumbers = await getKeyNumbers(client, {
  siteId: 1,
  period: 'day',
  date: 'today',
});

const popularUrls = await getMostPopularUrls(client, {
  siteId: 1,
  period: 'week',
  date: 'last7',
  limit: 5,
});
```

## SDK Usage (Tracking)
```ts
import { MatomoTrackingClient } from '@matokit/sdk';

const tracking = new MatomoTrackingClient({
  baseUrl: process.env.MATOMO_BASE_URL!,
  tokenAuth: process.env.MATOMO_TOKEN!,
  defaultSiteId: 1,
});

await tracking.trackPageview({
  url: 'https://example.com/checkout',
  title: 'Checkout',
  uid: 'user_123',
});

await tracking.trackEvent({
  category: 'checkout',
  action: 'complete',
  value: 49.99,
});
```
