import { describe, expect, it } from 'vitest';

import { buildDiscoveryManifest } from './discovery.js';

describe('buildDiscoveryManifest', () => {
  it('emits the Opal function transport contract for all tools', () => {
    const manifest = buildDiscoveryManifest({ authType: 'bearer' });

    expect(manifest).toStrictEqual({
      schemaVersion: '1',
      service: {
        name: 'MatomoTools',
        description: 'LLM-callable endpoints for Matomo analytics',
        version: '0.1.0',
      },
      auth: { type: 'bearer' },
      tools: [
        {
          type: 'function',
          function: {
            name: 'GetKeyNumbers',
            description: 'Fetch Matomo key metrics (visits, users, pageviews, etc.) for a site/date range.',
            parameters: {
              type: 'object',
              properties: {
                siteId: {
                  type: 'integer',
                  description: 'Matomo site ID. Defaults to DEFAULT_SITE_ID when omitted.',
                },
                period: {
                  type: 'string',
                  enum: ['day', 'week', 'month', 'year', 'range'],
                  description: 'Matomo period (day, week, month, year, range).',
                },
                date: {
                  type: 'string',
                  description: 'Date expression accepted by Matomo (e.g. 2024-03-01, today, last7).',
                },
                segment: {
                  type: 'string',
                  description: 'Optional Matomo segment expression (see Matomo Segmentation docs).',
                },
              },
              required: ['period', 'date'],
            },
            returns: {
              type: 'object',
              properties: {
                nb_visits: { type: 'number' },
                nb_uniq_visitors: { type: 'number' },
                nb_users: { type: 'number' },
                nb_pageviews: { type: 'number' },
                nb_actions: { type: 'number' },
                sum_visit_length: { type: 'number' },
                bounce_rate: { type: 'number' },
                avg_time_on_site: { type: 'number' },
              },
              required: ['nb_visits'],
            },
          },
          transport: {
            type: 'http',
            method: 'POST',
            path: '/tools/GetKeyNumbers',
          },
        },
        {
          type: 'function',
          function: {
            name: 'GetMostPopularUrls',
            description: 'Return the most visited URLs for the specified period.',
            parameters: {
              type: 'object',
              properties: {
                siteId: {
                  type: 'integer',
                  description: 'Matomo site ID. Defaults to DEFAULT_SITE_ID when omitted.',
                },
                period: {
                  type: 'string',
                  enum: ['day', 'week', 'month', 'year', 'range'],
                  description: 'Matomo period (day, week, month, year, range).',
                },
                date: {
                  type: 'string',
                  description: 'Date expression accepted by Matomo (e.g. 2024-03-01, today, last7).',
                },
                segment: {
                  type: 'string',
                  description: 'Optional Matomo segment expression (see Matomo Segmentation docs).',
                },
                limit: {
                  type: 'integer',
                  description: 'Maximum rows to return (defaults vary by endpoint).',
                },
                flat: {
                  type: 'boolean',
                  description: 'Set false to include hierarchical labels instead of flat list.',
                },
              },
              required: ['period', 'date'],
            },
            returns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  url: { type: 'string' },
                  nb_hits: { type: 'number' },
                  nb_visits: { type: 'number' },
                  sum_time_spent: { type: 'number' },
                },
                required: ['label', 'nb_hits'],
              },
            },
          },
          transport: {
            type: 'http',
            method: 'POST',
            path: '/tools/GetMostPopularUrls',
          },
        },
        {
          type: 'function',
          function: {
            name: 'GetTopReferrers',
            description: 'Fetch top referrers driving traffic to the site.',
            parameters: {
              type: 'object',
              properties: {
                siteId: {
                  type: 'integer',
                  description: 'Matomo site ID. Defaults to DEFAULT_SITE_ID when omitted.',
                },
                period: {
                  type: 'string',
                  enum: ['day', 'week', 'month', 'year', 'range'],
                  description: 'Matomo period (day, week, month, year, range).',
                },
                date: {
                  type: 'string',
                  description: 'Date expression accepted by Matomo (e.g. 2024-03-01, today, last7).',
                },
                segment: {
                  type: 'string',
                  description: 'Optional Matomo segment expression (see Matomo Segmentation docs).',
                },
                limit: {
                  type: 'integer',
                  description: 'Maximum rows to return (defaults vary by endpoint).',
                },
              },
              required: ['period', 'date'],
            },
            returns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  url: { type: 'string' },
                  referrer_type: { type: 'string' },
                  nb_visits: { type: 'number' },
                  nb_hits: { type: 'number' },
                },
                required: ['label', 'nb_visits'],
              },
            },
          },
          transport: {
            type: 'http',
            method: 'POST',
            path: '/tools/GetTopReferrers',
          },
        },
        {
          type: 'function',
          function: {
            name: 'GetEvents',
            description: 'Return Matomo events filtered by category/action/name.',
            parameters: {
              type: 'object',
              properties: {
                siteId: {
                  type: 'integer',
                  description: 'Matomo site ID. Defaults to DEFAULT_SITE_ID when omitted.',
                },
                period: {
                  type: 'string',
                  enum: ['day', 'week', 'month', 'year', 'range'],
                  description: 'Matomo period (day, week, month, year, range).',
                },
                date: {
                  type: 'string',
                  description: 'Date expression accepted by Matomo (e.g. 2024-03-01, today, last7).',
                },
                segment: {
                  type: 'string',
                  description: 'Optional Matomo segment expression (see Matomo Segmentation docs).',
                },
                category: {
                  type: 'string',
                  description: 'Event category filter (optional).',
                },
                action: {
                  type: 'string',
                  description: 'Event action filter (optional).',
                },
                name: {
                  type: 'string',
                  description: 'Event name filter (optional).',
                },
                limit: {
                  type: 'integer',
                  description: 'Maximum rows to return (defaults vary by endpoint).',
                },
              },
              required: ['period', 'date'],
            },
            returns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  nb_events: { type: 'number' },
                  nb_visits: { type: 'number' },
                  nb_hits: { type: 'number' },
                  sum_event_value: { type: 'number' },
                  max_event_value: { type: 'number' },
                  min_event_value: { type: 'number' },
                },
                required: ['label', 'nb_events'],
              },
            },
          },
          transport: {
            type: 'http',
            method: 'POST',
            path: '/tools/GetEvents',
          },
        },
      ],
    });
  });

  it('reflects unauthenticated deployments', () => {
    const manifest = buildDiscoveryManifest({ authType: 'none' });

    expect(manifest.auth).toStrictEqual({ type: 'none' });
  });
});
