import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildServer } from '../server.js';
describe('tracking routes', () => {
    const baseEnv = {
        NODE_ENV: 'test',
        MATOMO_BASE_URL: 'https://analytics.example.com',
        MATOMO_TOKEN: 'token',
        PORT: 4000,
        HOST: '127.0.0.1',
        DEFAULT_SITE_ID: 7,
        OPAL_BEARER_TOKEN: 'bearer-123',
    };
    let trackingClient;
    let close;
    beforeEach(() => {
        trackingClient = {
            trackPageview: vi.fn().mockResolvedValue(undefined),
            trackEvent: vi.fn().mockResolvedValue(undefined),
            trackGoal: vi.fn().mockResolvedValue(undefined),
        };
    });
    afterEach(async () => {
        if (close) {
            await close();
            close = undefined;
        }
    });
    const build = async () => {
        const { app } = await buildServer({
            env: baseEnv,
            trackingClient: trackingClient,
        });
        close = () => app.close();
        return app;
    };
    it('enforces bearer auth', async () => {
        const app = await build();
        const response = await app.inject({
            method: 'POST',
            url: '/track/Pageview',
            payload: {
                url: 'https://example.com',
            },
        });
        expect(response.statusCode).toBe(401);
        expect(trackingClient.trackPageview).not.toHaveBeenCalled();
    });
    it('queues pageview tracking', async () => {
        const app = await build();
        const response = await app.inject({
            method: 'POST',
            url: '/track/Pageview',
            headers: { Authorization: 'Bearer bearer-123' },
            payload: {
                url: 'https://example.com',
                title: 'Home',
            },
        });
        expect(response.statusCode).toBe(202);
        expect(response.json()).toEqual({ status: 'queued' });
        expect(trackingClient.trackPageview).toHaveBeenCalledWith({
            url: 'https://example.com',
            title: 'Home',
        });
    });
    it('handles event tracking payload', async () => {
        const app = await build();
        const response = await app.inject({
            method: 'POST',
            url: '/track/Event',
            headers: { Authorization: 'Bearer bearer-123' },
            payload: {
                siteId: 10,
                category: 'user',
                action: 'signup',
                name: 'cta',
                value: 3,
            },
        });
        expect(response.statusCode).toBe(202);
        expect(trackingClient.trackEvent).toHaveBeenCalledWith({
            siteId: 10,
            category: 'user',
            action: 'signup',
            name: 'cta',
            value: 3,
        });
    });
    it('returns 502 when tracking client throws', async () => {
        trackingClient.trackGoal.mockRejectedValue(new Error('fail'));
        const app = await build();
        const response = await app.inject({
            method: 'POST',
            url: '/track/Goal',
            headers: { Authorization: 'Bearer bearer-123' },
            payload: {
                idGoal: 2,
            },
        });
        expect(response.statusCode).toBe(502);
        expect(response.json()).toEqual({
            error: 'Bad Gateway',
            message: 'Matomo tracking failed',
            statusCode: 502,
        });
    });
});
//# sourceMappingURL=tracking.test.js.map