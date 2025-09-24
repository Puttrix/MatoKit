import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildServer } from '../server';
describe('reporting routes', () => {
    const baseEnv = {
        NODE_ENV: 'test',
        MATOMO_BASE_URL: 'https://analytics.example.com',
        MATOMO_TOKEN: 'token',
        PORT: 4000,
        HOST: '127.0.0.1',
        DEFAULT_SITE_ID: 7,
        OPAL_BEARER_TOKEN: 'bearer-123',
    };
    let matomoGet;
    let trackingClient;
    let close;
    beforeEach(() => {
        matomoGet = vi.fn();
        trackingClient = {
            trackPageview: vi.fn(),
            trackEvent: vi.fn(),
            trackGoal: vi.fn(),
        };
    });
    afterEach(async () => {
        if (close) {
            await close();
            close = undefined;
        }
    });
    const build = async () => {
        const matomoClient = { get: matomoGet };
        const { app } = await buildServer({
            env: baseEnv,
            matomoClient,
            trackingClient: trackingClient,
        });
        close = () => app.close();
        return app;
    };
    it('rejects unauthenticated requests when bearer token required', async () => {
        const app = await build();
        const response = await app.inject({
            method: 'POST',
            url: '/tools/GetKeyNumbers',
            payload: {
                period: 'day',
                date: 'today',
            },
        });
        expect(response.statusCode).toBe(401);
        expect(matomoGet).not.toHaveBeenCalled();
    });
    it('invokes key numbers helper with default site', async () => {
        matomoGet.mockResolvedValue({ nb_visits: 10 });
        const app = await build();
        const response = await app.inject({
            method: 'POST',
            url: '/tools/GetKeyNumbers',
            headers: { Authorization: 'Bearer bearer-123' },
            payload: {
                period: 'day',
                date: 'today',
            },
        });
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({ nb_visits: 10 });
        expect(matomoGet).toHaveBeenCalledWith({
            method: 'VisitsSummary.get',
            params: {
                idSite: 7,
                period: 'day',
                date: 'today',
            },
            schema: expect.anything(),
        });
        expect(response.headers['x-cache-hit']).toBe('0');
    });
    it('passes through siteId and limit for popular urls', async () => {
        matomoGet.mockResolvedValue([]);
        const app = await build();
        const response = await app.inject({
            method: 'POST',
            url: '/tools/GetMostPopularUrls',
            headers: { Authorization: 'Bearer bearer-123' },
            payload: {
                siteId: 5,
                period: 'week',
                date: '2024-03-01',
                limit: 5,
                flat: false,
            },
        });
        expect(response.statusCode).toBe(200);
        expect(matomoGet).toHaveBeenCalledWith({
            method: 'Actions.getPageUrls',
            params: {
                idSite: 5,
                period: 'week',
                date: '2024-03-01',
                filter_limit: 5,
                filter_offset: 0,
                flat: 0,
            },
            schema: expect.anything(),
        });
        expect(response.headers['x-pagination-limit']).toBe('5');
        expect(response.headers['x-cache-hit']).toBe('0');
    });
    it('serves discovery manifest with auth metadata and schemas', async () => {
        const app = await build();
        const response = await app.inject({ method: 'GET', url: '/.well-known/tools.json' });
        expect(response.statusCode).toBe(200);
        const manifest = JSON.parse(response.payload);
        expect(manifest.tools).toHaveLength(4);
        expect(manifest.auth).toEqual({ type: 'bearer' });
        const keyNumbers = manifest.tools.find((tool) => tool.name === 'GetKeyNumbers');
        expect(keyNumbers.inputSchema.required).toEqual(['period', 'date']);
        expect(keyNumbers.outputSchema.oneOf).toHaveLength(2);
        const events = manifest.tools.find((tool) => tool.name === 'GetEvents');
        expect(events.inputSchema.properties).toMatchObject({
            category: { type: 'string' },
            action: { type: 'string' },
            name: { type: 'string' },
        });
    });
    it('marks cached responses on subsequent calls', async () => {
        matomoGet.mockResolvedValueOnce({ nb_visits: 42 });
        matomoGet.mockResolvedValueOnce({ nb_visits: 42 });
        const app = await build();
        const first = await app.inject({
            method: 'POST',
            url: '/tools/GetKeyNumbers',
            headers: { Authorization: 'Bearer bearer-123' },
            payload: {
                period: 'day',
                date: 'today',
            },
        });
        const second = await app.inject({
            method: 'POST',
            url: '/tools/GetKeyNumbers',
            headers: { Authorization: 'Bearer bearer-123' },
            payload: {
                period: 'day',
                date: 'today',
            },
        });
        expect(first.headers['x-cache-hit']).toBe('0');
        expect(second.headers['x-cache-hit']).toBe('1');
    });
});
//# sourceMappingURL=reporting.test.js.map