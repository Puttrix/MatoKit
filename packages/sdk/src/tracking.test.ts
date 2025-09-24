import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MatomoTrackingClient,
  type TrackEventOptions,
  type TrackPageviewOptions,
} from './tracking.js';

describe('MatomoTrackingClient', () => {
  const baseConfig = {
    baseUrl: 'https://matomo.example.com/',
    tokenAuth: 'token',
    defaultSiteId: 1,
  } as const;

  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
  });

  const createClient = () =>
    new MatomoTrackingClient({
      ...baseConfig,
      fetch: fetchMock,
      concurrency: 1,
      retryDelayMs: 10,
    });

  it('sends pageview payloads with url and title', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 200 }));
    const client = createClient();

    const options: TrackPageviewOptions = {
      url: 'https://example.com',
      title: 'Home',
      uid: 'user-1',
      pvId: 'pv123',
    };

    await client.trackPageview(options);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://matomo.example.com/matomo.php');
    const body = init?.body as URLSearchParams;
    expect(body.get('url')).toBe('https://example.com');
    expect(body.get('action_name')).toBe('Home');
    expect(body.get('uid')).toBe('user-1');
    expect(body.get('pv_id')).toBe('pv123');
  });

  it('queues calls sequentially', async () => {
    const resolutions: Array<() => void> = [];
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolutions.push(() => resolve(new Response('', { status: 200 })));
        }),
    );

    const client = createClient();

    const promiseA = client.trackPageview({ url: 'https://example.com/a' });
    const promiseB = client.trackPageview({ url: 'https://example.com/b' });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolutions[0]();
    await promiseA;

    expect(fetchMock).toHaveBeenCalledTimes(2);

    resolutions[1]();
    await promiseB;
  });

  it('retries failed requests before throwing', async () => {
    vi.useFakeTimers();
    const errorResponse = new Response('', { status: 500 });
    fetchMock.mockResolvedValueOnce(errorResponse);
    fetchMock.mockResolvedValueOnce(errorResponse);
    fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }));

    const client = createClient();
    const promise = client.trackEvent({ category: 'cat', action: 'act' });

    await vi.runAllTimersAsync();
    await promise;
    expect(fetchMock).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it('throws tracking_error after exceeding retries', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const client = createClient();

    await expect(client.trackGoal({ idGoal: 2 })).rejects.toMatchObject({
      code: 'tracking_error',
    });
  });

  it('accepts Date timestamps for custom datetime', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 200 }));
    const client = createClient();
    const ts = new Date('2024-03-17T10:30:00Z');

    await client.trackEvent({ category: 'signup', action: 'click', ts } satisfies TrackEventOptions);

    const body = fetchMock.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get('cdt')).toBe('2024-03-17 10:30:00');
  });
});
