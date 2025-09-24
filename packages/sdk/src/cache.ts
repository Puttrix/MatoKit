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

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

export class ReportingCache {
  private readonly cache = new Map<string, CacheEntry>();

  private readonly ttlMs: number;

  private readonly maxSize: number;

  constructor(options: ReportingCacheOptions = {}) {
    this.ttlMs = options.ttlMs ?? 60_000;
    this.maxSize = options.maxSize ?? 100;
  }

  public get<T>(key: CacheKeyInput): { value: T | undefined; metadata: CacheMetadata } {
    const cacheKey = this.serialize(key);
    const entry = this.cache.get(cacheKey);

    if (!entry || entry.expiresAt <= Date.now()) {
      if (entry) {
        this.cache.delete(cacheKey);
      }
      return {
        value: undefined,
        metadata: {
          hit: false,
          ttl: 0,
        },
      };
    }

    return {
      value: entry.value as T,
      metadata: {
        hit: true,
        ttl: entry.expiresAt - Date.now(),
      },
    };
  }

  public set<T>(key: CacheKeyInput, value: T): CacheMetadata {
    const cacheKey = this.serialize(key);

    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey as string);
      }
    }

    const expiresAt = Date.now() + this.ttlMs;
    this.cache.set(cacheKey, { value, expiresAt });

    return {
      hit: false,
      ttl: this.ttlMs,
    };
  }

  private serialize(input: CacheKeyInput): string {
    const normalized = {
      method: input.method,
      params: Object.keys(input.params)
        .sort()
        .reduce<Record<string, unknown>>((acc, current) => {
          acc[current] = input.params[current];
          return acc;
        }, {}),
    };
    return JSON.stringify(normalized);
  }
}
