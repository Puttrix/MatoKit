import { Function as OpalFunction, Parameter, ParameterType } from '@optimizely-opal/opal-tools-sdk';

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

type ParameterDefinition = {
  name: string;
  type: ParameterType;
  description: string;
  required: boolean;
};

type DiscoveryFunctionDefinition = {
  name: string;
  description: string;
  path: string;
  method: 'POST';
  parameters: ParameterDefinition[];
};

const discoveryFunctions: DiscoveryFunctionDefinition[] = [
  {
    name: 'GetKeyNumbers',
    description: 'Fetch Matomo key metrics (visits, users, pageviews, etc.) for a site/date range.',
    path: '/tools/GetKeyNumbers',
    method: 'POST',
    parameters: [
      {
        name: 'siteId',
        type: ParameterType.Integer,
        description: 'Matomo site ID. Defaults to DEFAULT_SITE_ID when omitted.',
        required: false,
      },
      {
        name: 'period',
        type: ParameterType.String,
        description: `Matomo period (${PERIODS.join(', ')}).`,
        required: true,
      },
      {
        name: 'date',
        type: ParameterType.String,
        description: 'Date expression accepted by Matomo (e.g. 2024-03-01, today, last7).',
        required: true,
      },
      {
        name: 'segment',
        type: ParameterType.String,
        description: 'Optional Matomo segment expression (see Matomo segmentation docs).',
        required: false,
      },
    ],
  },
  {
    name: 'GetMostPopularUrls',
    description: 'Return the most visited URLs for the specified period.',
    path: '/tools/GetMostPopularUrls',
    method: 'POST',
    parameters: [
      {
        name: 'siteId',
        type: ParameterType.Integer,
        description: 'Matomo site ID. Defaults to DEFAULT_SITE_ID when omitted.',
        required: false,
      },
      {
        name: 'period',
        type: ParameterType.String,
        description: `Matomo period (${PERIODS.join(', ')}).`,
        required: true,
      },
      {
        name: 'date',
        type: ParameterType.String,
        description: 'Date expression accepted by Matomo (e.g. today, last7, 2024-03-01).',
        required: true,
      },
      {
        name: 'segment',
        type: ParameterType.String,
        description: 'Optional Matomo segment expression (see Matomo segmentation docs).',
        required: false,
      },
      {
        name: 'limit',
        type: ParameterType.Integer,
        description: 'Maximum rows to return (defaults vary by endpoint).',
        required: false,
      },
      {
        name: 'flat',
        type: ParameterType.Boolean,
        description: 'Set false to include hierarchical labels instead of flat list.',
        required: false,
      },
    ],
  },
  {
    name: 'GetTopReferrers',
    description: 'Fetch top referrers driving traffic to the site.',
    path: '/tools/GetTopReferrers',
    method: 'POST',
    parameters: [
      {
        name: 'siteId',
        type: ParameterType.Integer,
        description: 'Matomo site ID. Defaults to DEFAULT_SITE_ID when omitted.',
        required: false,
      },
      {
        name: 'period',
        type: ParameterType.String,
        description: `Matomo period (${PERIODS.join(', ')}).`,
        required: true,
      },
      {
        name: 'date',
        type: ParameterType.String,
        description: 'Date expression accepted by Matomo (e.g. today, last7, 2024-03-01).',
        required: true,
      },
      {
        name: 'segment',
        type: ParameterType.String,
        description: 'Optional Matomo segment expression (see Matomo segmentation docs).',
        required: false,
      },
      {
        name: 'limit',
        type: ParameterType.Integer,
        description: 'Maximum rows to return (defaults vary by endpoint).',
        required: false,
      },
    ],
  },
  {
    name: 'GetEvents',
    description: 'Return Matomo events filtered by category/action/name.',
    path: '/tools/GetEvents',
    method: 'POST',
    parameters: [
      {
        name: 'siteId',
        type: ParameterType.Integer,
        description: 'Matomo site ID. Defaults to DEFAULT_SITE_ID when omitted.',
        required: false,
      },
      {
        name: 'period',
        type: ParameterType.String,
        description: `Matomo period (${PERIODS.join(', ')}).`,
        required: true,
      },
      {
        name: 'date',
        type: ParameterType.String,
        description: 'Date expression accepted by Matomo (e.g. today, last7, 2024-03-01).',
        required: true,
      },
      {
        name: 'segment',
        type: ParameterType.String,
        description: 'Optional Matomo segment expression (see Matomo segmentation docs).',
        required: false,
      },
      {
        name: 'category',
        type: ParameterType.String,
        description: 'Event category filter (optional).',
        required: false,
      },
      {
        name: 'action',
        type: ParameterType.String,
        description: 'Event action filter (optional).',
        required: false,
      },
      {
        name: 'name',
        type: ParameterType.String,
        description: 'Event name filter (optional).',
        required: false,
      },
      {
        name: 'limit',
        type: ParameterType.Integer,
        description: 'Maximum rows to return (defaults vary by endpoint).',
        required: false,
      },
    ],
  },
];

function buildOpalFunction(definition: DiscoveryFunctionDefinition): OpalFunction {
  const parameters = definition.parameters.map(
    (param) => new Parameter(param.name, param.type, param.description, param.required),
  );

  const opalFunction = new OpalFunction(
    definition.name,
    definition.description,
    parameters,
    definition.path,
  );

  opalFunction.httpMethod = definition.method;
  return opalFunction;
}

export function buildDiscoveryManifest({ authType }: DiscoveryOptions) {
  const functions = discoveryFunctions.map(buildOpalFunction).map((fn) => fn.toJSON());

  return {
    schemaVersion: '1',
    service: {
      name: 'MatomoTools',
      description: 'LLM-callable endpoints for Matomo analytics',
      version: '0.1.0',
    },
    auth: { type: authType },
    functions,
  };
}
