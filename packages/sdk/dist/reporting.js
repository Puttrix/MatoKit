import { ReportingCache } from './cache.js';
import { EventRowSchema, EventsSchema, KeyNumbersSchema, PopularUrlsSchema, TopReferrersSchema, } from './schemas/reporting.js';
export const MATOMO_PERIODS = ['day', 'week', 'month', 'year', 'range'];
function buildBaseParams(options) {
    const params = {
        idSite: options.siteId,
        period: options.period,
        date: options.date,
    };
    if (options.segment) {
        params.segment = options.segment;
    }
    return params;
}
function clampLimit(limit, fallback, max) {
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
function normalizePage(page) {
    if (page === undefined) {
        return 0;
    }
    if (!Number.isFinite(page) || page < 0) {
        return 0;
    }
    return Math.floor(page);
}
export class ReportingService {
    client;
    cache;
    constructor(client, options = {}) {
        this.client = client;
        this.cache = new ReportingCache({
            ttlMs: options.ttlMs,
            maxSize: options.maxSize,
        });
    }
    async getKeyNumbers(options) {
        const params = buildBaseParams(options);
        const cacheKey = { method: 'VisitsSummary.get', params };
        const cached = this.cache.get(cacheKey);
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
    async getMostPopularUrls(options) {
        const limit = clampLimit(options.limit, 10, 1000);
        const page = normalizePage(options.page);
        const params = {
            ...buildBaseParams(options),
            filter_limit: limit,
            filter_offset: page * limit,
            flat: options.flat === false ? 0 : 1,
        };
        const cacheKey = { method: 'Actions.getPageUrls', params };
        const cached = this.cache.get(cacheKey);
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
    async getTopReferrers(options) {
        const limit = clampLimit(options.limit, 10, 1000);
        const page = normalizePage(options.page);
        const params = {
            ...buildBaseParams(options),
            filter_limit: limit,
            filter_offset: page * limit,
        };
        const cacheKey = { method: 'Referrers.getAll', params };
        const cached = this.cache.get(cacheKey);
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
    async getEvents(options) {
        const limit = clampLimit(options.limit, 25, 1000);
        const page = normalizePage(options.page);
        const params = {
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
        const cached = this.cache.get(cacheKey);
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
//# sourceMappingURL=reporting.js.map