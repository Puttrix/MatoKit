export interface CacheKeyInput {
    method: string;
    params: Record<string, unknown>;
}
export interface CacheMetadata {
    hit: boolean;
    ttl: number;
}
export interface ReportingCacheOptions {
    ttlMs?: number;
    maxSize?: number;
}
export declare class ReportingCache {
    private readonly cache;
    private readonly ttlMs;
    private readonly maxSize;
    constructor(options?: ReportingCacheOptions);
    get<T>(key: CacheKeyInput): {
        value: T | undefined;
        metadata: CacheMetadata;
    };
    set<T>(key: CacheKeyInput, value: T): CacheMetadata;
    private serialize;
}
//# sourceMappingURL=cache.d.ts.map