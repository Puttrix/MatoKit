export class ReportingCache {
    cache = new Map();
    ttlMs;
    maxSize;
    constructor(options = {}) {
        this.ttlMs = options.ttlMs ?? 60_000;
        this.maxSize = options.maxSize ?? 100;
    }
    get(key) {
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
            value: entry.value,
            metadata: {
                hit: true,
                ttl: entry.expiresAt - Date.now(),
            },
        };
    }
    set(key, value) {
        const cacheKey = this.serialize(key);
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }
        const expiresAt = Date.now() + this.ttlMs;
        this.cache.set(cacheKey, { value, expiresAt });
        return {
            hit: false,
            ttl: this.ttlMs,
        };
    }
    serialize(input) {
        const normalized = {
            method: input.method,
            params: Object.keys(input.params)
                .sort()
                .reduce((acc, current) => {
                acc[current] = input.params[current];
                return acc;
            }, {}),
        };
        return JSON.stringify(normalized);
    }
}
//# sourceMappingURL=cache.js.map