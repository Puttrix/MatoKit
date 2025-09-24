export interface TrackingClientConfig {
    baseUrl: string;
    tokenAuth: string;
    trackPath?: string;
    defaultSiteId?: number;
    fetch?: typeof fetch;
    concurrency?: number;
    maxRetries?: number;
    retryDelayMs?: number;
}
interface BaseTrackingOptions {
    siteId?: number;
    uid?: string;
    pvId?: string;
    ts?: number | Date;
}
export interface TrackPageviewOptions extends BaseTrackingOptions {
    url: string;
    title?: string;
}
export interface TrackEventOptions extends BaseTrackingOptions {
    category: string;
    action: string;
    name?: string;
    value?: number;
}
export interface TrackGoalOptions extends BaseTrackingOptions {
    idGoal: number;
    revenue?: number;
}
export declare class MatomoTrackingClient {
    private readonly config;
    private readonly queue;
    private readonly fetchImpl;
    private readonly trackUrl;
    private readonly maxRetries;
    private readonly retryDelayMs;
    constructor(config: TrackingClientConfig);
    trackPageview(options: TrackPageviewOptions): Promise<void>;
    trackEvent(options: TrackEventOptions): Promise<void>;
    trackGoal(options: TrackGoalOptions): Promise<void>;
    private enqueue;
    private dispatchWithRetry;
}
export {};
//# sourceMappingURL=tracking.d.ts.map