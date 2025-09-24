import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createMatomoClient } from './client';
describe('createMatomoClient', () => {
    const baseUrl = 'https://matomo.example.com/';
    const tokenAuth = 'secret-token';
    beforeEach(() => {
        vi.restoreAllMocks();
    });
    it('builds a Matomo API URL with defaults and params', async () => {
        const responseBody = [{ label: 'Homepage', nb_hits: 42 }];
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(responseBody), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        }));
        const client = createMatomoClient({
            baseUrl,
            tokenAuth,
            defaultParams: {
                period: 'day',
                date: 'yesterday',
            },
            fetch: fetchMock,
        });
        const result = await client.get({
            method: 'Actions.getPageUrls',
            params: {
                idSite: 1,
                segment: 'visitCountry==US',
            },
        });
        expect(result).toEqual(responseBody);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(init).toMatchObject({ method: 'GET' });
        const parsedUrl = new URL(url);
        expect(parsedUrl.pathname).toBe('/index.php');
        expect(parsedUrl.searchParams.get('module')).toBe('API');
        expect(parsedUrl.searchParams.get('format')).toBe('json');
        expect(parsedUrl.searchParams.get('token_auth')).toBe(tokenAuth);
        expect(parsedUrl.searchParams.get('method')).toBe('Actions.getPageUrls');
        expect(parsedUrl.searchParams.get('segment')).toBe('visitCountry==US');
    });
    it('throws MatomoClientError for non-ok HTTP responses', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response('Internal Server Error', { status: 500 }));
        const client = createMatomoClient({
            baseUrl,
            tokenAuth,
            fetch: fetchMock,
        });
        await expect(client.get({ method: 'VisitsSummary.get' })).rejects.toMatchObject({
            code: 'http_error',
            status: 500,
        });
    });
    it('throws MatomoClientError when Matomo reports an application error', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: 'error', message: 'Invalid token_auth' }), { status: 200, headers: { 'content-type': 'application/json' } }));
        const client = createMatomoClient({
            baseUrl,
            tokenAuth,
            fetch: fetchMock,
        });
        await expect(client.get({ method: 'VisitsSummary.get' })).rejects.toMatchObject({
            code: 'matomo_error',
        });
    });
    it('validates responses when schema provided', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ nb_visits: '12', nb_pageviews: '30' }), { status: 200, headers: { 'content-type': 'application/json' } }));
        const client = createMatomoClient({ baseUrl, tokenAuth, fetch: fetchMock });
        const Schema = z.object({ nb_visits: z.coerce.number(), nb_pageviews: z.coerce.number() });
        const response = await client.get({
            method: 'VisitsSummary.get',
            schema: Schema,
        });
        expect(response).toEqual({ nb_visits: 12, nb_pageviews: 30 });
    });
    it('throws validation_error when schema parsing fails', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ nb_visits: 'abc' }), { status: 200, headers: { 'content-type': 'application/json' } }));
        const client = createMatomoClient({ baseUrl, tokenAuth, fetch: fetchMock });
        await expect(client.get({
            method: 'VisitsSummary.get',
            schema: z.object({ nb_visits: z.number() }),
        })).rejects.toMatchObject({
            code: 'validation_error',
        });
    });
    it('aborts the request when timeout is reached', async () => {
        vi.useFakeTimers();
        const fetchMock = vi.fn().mockImplementation((_, init) => {
            return new Promise((_resolve, reject) => {
                init?.signal?.addEventListener('abort', () => {
                    const abortError = new Error('Aborted');
                    abortError.name = 'AbortError';
                    reject(abortError);
                });
            });
        });
        const client = createMatomoClient({
            baseUrl,
            tokenAuth,
            fetch: fetchMock,
            timeoutMs: 1000,
        });
        const promise = client.get({ method: 'VisitsSummary.get' });
        const expectation = expect(promise).rejects.toMatchObject({
            code: 'timeout',
        });
        try {
            await vi.advanceTimersByTimeAsync(1000);
            await expectation;
        }
        finally {
            vi.useRealTimers();
        }
    });
});
//# sourceMappingURL=client.test.js.map