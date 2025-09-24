import PQueue from 'p-queue';
import { MatomoClientError } from './errors.js';
const DEFAULT_TRACK_PATH = 'matomo.php';
const DEFAULT_RETRY_DELAY_MS = 300;
function ensureSiteId(config, siteId) {
    const value = siteId ?? config.defaultSiteId;
    if (value === undefined) {
        throw new MatomoClientError('siteId is required for tracking call', {
            code: 'matomo_error',
        });
    }
    return value;
}
function toCdt(ts) {
    if (!ts) {
        return undefined;
    }
    const date = ts instanceof Date ? ts : new Date(ts);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }
    const iso = date.toISOString();
    return iso.replace('T', ' ').substring(0, 19);
}
function buildBasePayload(config, options) {
    const idsite = ensureSiteId(config, options.siteId);
    const data = {
        idsite: idsite.toString(),
        token_auth: config.tokenAuth,
        rec: '1',
    };
    if (options.uid) {
        data.uid = options.uid;
    }
    if (options.pvId) {
        data.pv_id = options.pvId;
    }
    const cdt = toCdt(options.ts);
    if (cdt) {
        data.cdt = cdt;
    }
    return { idsite, data };
}
async function delay(ms) {
    if (ms <= 0) {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
export class MatomoTrackingClient {
    config;
    queue;
    fetchImpl;
    trackUrl;
    maxRetries;
    retryDelayMs;
    constructor(config) {
        this.config = config;
        this.fetchImpl = config.fetch ?? globalThis.fetch;
        if (typeof this.fetchImpl !== 'function') {
            throw new MatomoClientError('Fetch API is not available', {
                code: 'no_fetch',
            });
        }
        const trackPath = config.trackPath ?? DEFAULT_TRACK_PATH;
        this.trackUrl = new URL(trackPath, config.baseUrl).toString();
        this.queue = new PQueue({
            concurrency: config.concurrency ?? 1,
        });
        this.maxRetries = config.maxRetries ?? 2;
        this.retryDelayMs = config.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
    }
    async trackPageview(options) {
        const payload = buildBasePayload(this.config, options);
        payload.data.url = options.url;
        if (options.title) {
            payload.data.action_name = options.title;
        }
        await this.enqueue(payload);
    }
    async trackEvent(options) {
        const payload = buildBasePayload(this.config, options);
        payload.data.e_c = options.category;
        payload.data.e_a = options.action;
        if (options.name) {
            payload.data.e_n = options.name;
        }
        if (typeof options.value === 'number') {
            payload.data.e_v = options.value.toString();
        }
        await this.enqueue(payload);
    }
    async trackGoal(options) {
        const payload = buildBasePayload(this.config, options);
        payload.data.idgoal = options.idGoal.toString();
        if (typeof options.revenue === 'number') {
            payload.data.revenue = options.revenue.toString();
        }
        await this.enqueue(payload);
    }
    async enqueue(payload) {
        await this.queue.add(() => this.dispatchWithRetry(payload));
    }
    async dispatchWithRetry(payload, attempt = 0) {
        try {
            const body = new URLSearchParams(payload.data);
            const response = await this.fetchImpl(this.trackUrl, {
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
                body,
            });
            if (!response.ok) {
                throw new MatomoClientError(`Matomo tracking HTTP error: ${response.status}`, {
                    code: 'http_error',
                    status: response.status,
                });
            }
        }
        catch (error) {
            if (attempt < this.maxRetries) {
                await delay(this.retryDelayMs * (attempt + 1));
                await this.dispatchWithRetry(payload, attempt + 1);
                return;
            }
            if (error instanceof MatomoClientError) {
                throw error;
            }
            throw new MatomoClientError('Matomo tracking request failed', {
                code: 'tracking_error',
                details: error,
                cause: error,
            });
        }
    }
}
//# sourceMappingURL=tracking.js.map