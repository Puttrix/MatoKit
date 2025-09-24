import { ReportingCache, type ReportingCacheOptions } from './cache.js';
import type { MatomoClient } from './client.js';
import {
  type EventRow,
  EventRowSchema,
  EventsSchema,
  type KeyNumbersResponse,
  KeyNumbersSchema,
  type PopularUrlRow,
  PopularUrlsSchema,
  type ReferrerRow,
  TopReferrersSchema,
} from './schemas/reporting.js';

export type ReportingClientOptions = ReportingCacheOptions;

export const MATOMO_PERIODS = ['day', 'week', 'month', 'year', 'range'] as const;

export type Period = (typeof MATOMO_PERIODS)[number];

interface BaseReportingOptions {
  siteId: number;
  period: Period;
  date: string;
  segment?: string;
}

export type GetKeyNumbersOptions = BaseReportingOptions;

export interface GetMostPopularUrlsOptions extends BaseReportingOptions {
  limit?: number;
  flat?: boolean;
  page?: number;
}

export interface GetTopReferrersOptions extends BaseReportingOptions {
  limit?: number;
  page?: number;
}

export interface GetEventsOptions extends BaseReportingOptions {
  category?: string;
  action?: string;
  name?: string;
  limit?: number;
  page?: number;
}

export interface ReportingResult<T> {
  data: T;
  cache: {
    hit: boolean;
    ttl: number;
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

function buildBaseParams(options: BaseReportingOptions): Record<string, string | number> {
  const params: Record<string, string | number> = {
    idSite: options.siteId,
    period: options.period,
    date: options.date,
  };

  if (options.segment) {
    params.segment = options.segment;
  }

  return params;
}

function clampLimit(limit: number | undefined, fallback: number, max: number): number {
  if (limit === undefined) {
    return fallback;
  }

  if (!Number.isFinite(limit) || limit < 1) {
    return fallback;
  }

  if (limit > max) {
    return max;
  }

  return Math.floor(limit);
}

function normalizePage(page?: number): number {
  if (page === undefined) {
    return 0;
  }
  if (!Number.isFinite(page) || page < 0) {
    return 0;
  }
  return Math.floor(page);
}

export class ReportingService {
  private readonly cache: ReportingCache;

  constructor(
    private readonly client: MatomoClient,
    options: ReportingClientOptions = {},
  ) {
    this.cache = new ReportingCache({
      ttlMs: options.ttlMs,
      maxSize: options.maxSize,
    });
  }

  public async getKeyNumbers(options: GetKeyNumbersOptions): Promise<ReportingResult<KeyNumbersResponse>> {
    const params = buildBaseParams(options);
    const cacheKey = { method: 'VisitsSummary.get', params };
    const cached = this.cache.get<KeyNumbersResponse>(cacheKey);
    if (cached.value) {
      return { data: cached.value, cache: cached.metadata };
    }

    const data = await this.client.get({
      method: cacheKey.method,
      params,
      schema: KeyNumbersSchema,
    });

    const metadata = this.cache.set(cacheKey, data);
    return { data, cache: metadata };
  }

  public async getMostPopularUrls(
    options: GetMostPopularUrlsOptions,
  ): Promise<ReportingResult<PopularUrlRow[]>> {
    const limit = clampLimit(options.limit, 10, 1000);
    const page = normalizePage(options.page);

    const params = {
      ...buildBaseParams(options),
      filter_limit: limit,
      filter_offset: page * limit,
      flat: options.flat === false ? 0 : 1,
    };

    const cacheKey = { method: 'Actions.getPageUrls', params };
    const cached = this.cache.get<PopularUrlRow[]>(cacheKey);
    if (cached.value) {
      return {
        data: cached.value,
        cache: cached.metadata,
        pagination: { page, limit },
      };
    }

    const data = await this.client.get({
      method: cacheKey.method,
      params,
      schema: PopularUrlsSchema,
    });
    const metadata = this.cache.set(cacheKey, data);
    return {
      data,
      cache: metadata,
      pagination: { page, limit },
    };
  }

  public async getTopReferrers(
    options: GetTopReferrersOptions,
  ): Promise<ReportingResult<ReferrerRow[]>> {
    const limit = clampLimit(options.limit, 10, 1000);
    const page = normalizePage(options.page);

    const params = {
      ...buildBaseParams(options),
      filter_limit: limit,
      filter_offset: page * limit,
    };

    const cacheKey = { method: 'Referrers.getAll', params };
    const cached = this.cache.get<ReferrerRow[]>(cacheKey);
    if (cached.value) {
      return {
        data: cached.value,
        cache: cached.metadata,
        pagination: { page, limit },
      };
    }

    const data = await this.client.get({
      method: cacheKey.method,
      params,
      schema: TopReferrersSchema,
    });
    const metadata = this.cache.set(cacheKey, data);
    return {
      data,
      cache: metadata,
      pagination: { page, limit },
    };
  }

  public async getEvents(options: GetEventsOptions): Promise<ReportingResult<EventRow[]>> {
    const limit = clampLimit(options.limit, 25, 1000);
    const page = normalizePage(options.page);

    const params: Record<string, string | number> = {
      ...buildBaseParams(options),
      filter_limit: limit,
      filter_offset: page * limit,
    };

    if (options.category) {
      params.eventCategory = options.category;
    }
    if (options.action) {
      params.eventAction = options.action;
    }
    if (options.name) {
      params.eventName = options.name;
    }

    const cacheKey = { method: 'Events.getAction', params };
    const cached = this.cache.get<EventRow[]>(cacheKey);
    if (cached.value) {
      return {
        data: cached.value,
        cache: cached.metadata,
        pagination: { page, limit },
      };
    }

    const result = await this.client.get({
      method: cacheKey.method,
      params,
      schema: EventsSchema,
    });
    const parsed = result.map((row) => EventRowSchema.parse(row));
    const metadata = this.cache.set(cacheKey, parsed);
    return {
      data: parsed,
      cache: metadata,
      pagination: { page, limit },
    };
  }
}
