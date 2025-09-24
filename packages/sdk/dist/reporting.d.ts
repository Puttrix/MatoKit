import { type ReportingCacheOptions } from './cache';
import type { MatomoClient } from './client';
import { type EventRow, type KeyNumbersResponse, type PopularUrlRow, type ReferrerRow } from './schemas/reporting';
export type ReportingClientOptions = ReportingCacheOptions;
export declare const MATOMO_PERIODS: readonly ["day", "week", "month", "year", "range"];
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
export declare class ReportingService {
    private readonly client;
    private readonly cache;
    constructor(client: MatomoClient, options?: ReportingClientOptions);
    getKeyNumbers(options: GetKeyNumbersOptions): Promise<ReportingResult<KeyNumbersResponse>>;
    getMostPopularUrls(options: GetMostPopularUrlsOptions): Promise<ReportingResult<PopularUrlRow[]>>;
    getTopReferrers(options: GetTopReferrersOptions): Promise<ReportingResult<ReferrerRow[]>>;
    getEvents(options: GetEventsOptions): Promise<ReportingResult<EventRow[]>>;
}
export {};
//# sourceMappingURL=reporting.d.ts.map