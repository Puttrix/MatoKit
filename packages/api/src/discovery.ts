import { PERIODS } from './schemas/reporting.js';

export type AuthType = 'bearer' | 'none';

export interface DiscoveryOptions {
  authType: AuthType;
}

const baseRequestProperties = {
  siteId: {
    type: 'integer',
    description: 'Matomo site ID. Defaults to DEFAULT_SITE_ID when omitted.',
  },
  period: {
    type: 'string',
    enum: [...PERIODS],
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
};

const keyNumbersRowSchema = {
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
};

const popularUrlRowSchema = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    url: { type: 'string' },
    nb_hits: { type: 'number' },
    nb_visits: { type: 'number' },
    sum_time_spent: { type: 'number' },
  },
  required: ['label', 'nb_hits'],
};

const referrerRowSchema = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    url: { type: 'string' },
    referrer_type: { type: 'string' },
    nb_visits: { type: 'number' },
    nb_hits: { type: 'number' },
  },
  required: ['label', 'nb_visits'],
};

const eventRowSchema = {
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
};

const discoveryTools = [
  {
    name: 'GetKeyNumbers',
    description: 'Fetch Matomo key metrics (visits, users, pageviews, etc.) for a site/date range.',
    method: 'POST',
    path: '/tools/GetKeyNumbers',
    parameters: {
      type: 'object',
      properties: baseRequestProperties,
      required: ['period', 'date'],
    },
    returns: {
      type: 'object',
      properties: keyNumbersRowSchema.properties,
      required: keyNumbersRowSchema.required,
    },
  },
  {
    name: 'GetMostPopularUrls',
    description: 'Return the most visited URLs for the specified period.',
    method: 'POST',
    path: '/tools/GetMostPopularUrls',
    parameters: {
      type: 'object',
      properties: {
        ...baseRequestProperties,
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
      items: popularUrlRowSchema,
    },
  },
  {
    name: 'GetTopReferrers',
    description: 'Fetch top referrers driving traffic to the site.',
    method: 'POST',
    path: '/tools/GetTopReferrers',
    parameters: {
      type: 'object',
      properties: {
        ...baseRequestProperties,
        limit: {
          type: 'integer',
          description: 'Maximum rows to return (defaults vary by endpoint).',
        },
      },
      required: ['period', 'date'],
    },
    returns: {
      type: 'array',
      items: referrerRowSchema,
    },
  },
  {
    name: 'GetEvents',
    description: 'Return Matomo events filtered by category/action/name.',
    method: 'POST',
    path: '/tools/GetEvents',
    parameters: {
      type: 'object',
      properties: {
        ...baseRequestProperties,
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
      items: eventRowSchema,
    },
  },
];

export function buildDiscoveryManifest({ authType }: DiscoveryOptions) {
  return {
    schemaVersion: '1',
    service: {
      name: 'MatomoTools',
      description: 'LLM-callable endpoints for Matomo analytics',
      version: '0.1.0',
    },
    auth: { type: authType },
    tools: discoveryTools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        returns: tool.returns,
      },
      transport: {
        type: 'http',
        method: tool.method,
        path: tool.path,
      },
    })),
  };
}
