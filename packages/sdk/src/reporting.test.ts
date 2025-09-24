import { describe, expect, it, vi } from 'vitest';

import type { MatomoClient } from './client';
import {
  type GetEventsOptions,
  type GetKeyNumbersOptions,
  type GetMostPopularUrlsOptions,
  type GetTopReferrersOptions,
  ReportingService,
} from './reporting';

describe('reporting helpers', () => {
  const baseOptions = {
    siteId: 1,
    period: 'day' as const,
    date: 'today',
  };

  const createService = () => {
    const get = vi.fn();
    const client: MatomoClient = {
      get,
    };
    const service = new ReportingService(client, { ttlMs: 1000, maxSize: 10 });
    return { service, get };
  };

  it('requests key numbers with base params', async () => {
    const { service, get } = createService();
    get.mockResolvedValue({ nb_visits: 10 });

    const result = await service.getKeyNumbers(baseOptions satisfies GetKeyNumbersOptions);

    expect(get).toHaveBeenCalledWith({
      method: 'VisitsSummary.get',
      params: {
        idSite: 1,
        period: 'day',
        date: 'today',
      },
      schema: expect.anything(),
    });
    expect(result.data).toEqual({ nb_visits: 10 });
    expect(result.cache.hit).toBe(false);
  });

  it('requests popular urls with default limit and flat flag', async () => {
    const { service, get } = createService();
    get.mockResolvedValue([]);

    const result = await service.getMostPopularUrls(baseOptions satisfies GetMostPopularUrlsOptions);

    expect(get).toHaveBeenCalledWith({
      method: 'Actions.getPageUrls',
      params: {
        idSite: 1,
        period: 'day',
        date: 'today',
        filter_limit: 10,
        filter_offset: 0,
        flat: 1,
      },
      schema: expect.anything(),
    });
    expect(result.pagination).toEqual({ page: 0, limit: 10 });
  });

  it('requests referrers with limit override', async () => {
    const { service, get } = createService();
    get.mockResolvedValue([]);

    const topReferrers = await service.getTopReferrers({
      ...baseOptions,
      limit: 50,
      segment: 'browserCode==FF',
    } satisfies GetTopReferrersOptions);

    expect(get).toHaveBeenCalledWith({
      method: 'Referrers.getAll',
      params: {
        idSite: 1,
        period: 'day',
        date: 'today',
        segment: 'browserCode==FF',
        filter_limit: 50,
        filter_offset: 0,
      },
      schema: expect.anything(),
    });
    expect(topReferrers.pagination).toEqual({ page: 0, limit: 50 });
  });

  it('maps event filters to Matomo params', async () => {
    const { service, get } = createService();
    get.mockResolvedValue([
      {
        label: 'signup',
        nb_events: 5,
      },
    ]);

    const result = await service.getEvents({
      ...baseOptions,
      category: 'user',
      action: 'signup',
      name: 'cta',
      limit: 15,
    } satisfies GetEventsOptions);

    expect(get).toHaveBeenCalledWith({
      method: 'Events.getAction',
      params: {
        idSite: 1,
        period: 'day',
        date: 'today',
        filter_limit: 15,
        filter_offset: 0,
        eventCategory: 'user',
        eventAction: 'signup',
        eventName: 'cta',
      },
      schema: expect.anything(),
    });

    expect(result.data[0]).toMatchObject({ nb_events: 5 });
    expect(result.pagination).toEqual({ page: 0, limit: 15 });
  });
});
