import {
  MatomoClientError,
  ReportingService,
} from '@matokit/sdk';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import type { Env } from '../config';
import { buildDiscoveryManifest } from '../discovery';
import {
  GetEventsRequestSchema,
  GetKeyNumbersRequestSchema,
  GetMostPopularUrlsRequestSchema,
  GetTopReferrersRequestSchema,
} from '../schemas/reporting';

function resolveSiteId(env: Env, siteId: number | undefined): number {
  if (siteId) {
    return siteId;
  }

  if (env.DEFAULT_SITE_ID) {
    return env.DEFAULT_SITE_ID;
  }

  throw new Error('siteId is required');
}

function ensureAuthorized(env: Env, request: FastifyRequest, reply: FastifyReply): boolean {
  if (!env.OPAL_BEARER_TOKEN) {
    return true;
  }

  const header = request.headers.authorization;
  const expected = `Bearer ${env.OPAL_BEARER_TOKEN}`;

  if (header !== expected) {
    void reply.unauthorized('Bearer token required');
    return false;
  }

  return true;
}

function logAndRespondUnknown(reply: FastifyReply, error: unknown) {
  reply.log.error(error);
  void reply.internalServerError('Unexpected error');
}

function handleMatomoError(error: unknown, reply: FastifyReply) {
  if (error instanceof MatomoClientError) {
    switch (error.code) {
      case 'timeout':
        void reply.gatewayTimeout('Matomo request timed out');
        return;
      case 'http_error':
      case 'matomo_error':
      case 'validation_error':
        void reply.badGateway(error.message);
        return;
      default:
        break;
    }
  }

  logAndRespondUnknown(reply, error);
}

export interface RegisterReportingRoutesOptions {
  app: FastifyInstance;
  env: Env;
  reportingService: ReportingService;
}

export async function registerReportingRoutes({
  app,
  env,
  reportingService,
}: RegisterReportingRoutesOptions): Promise<void> {
  const requireAuth = (request: FastifyRequest, reply: FastifyReply) =>
    ensureAuthorized(env, request, reply);

  app.post('/tools/GetKeyNumbers', async (request, reply) => {
    if (!requireAuth(request, reply)) {
      return;
    }

    const parsed = GetKeyNumbersRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      void reply.badRequest('Invalid request body');
      return;
    }

    try {
      const siteId = resolveSiteId(env, parsed.data.siteId);
      const result = await reportingService.getKeyNumbers({
        ...parsed.data,
        siteId,
      });

      void reply.headers({
        'x-cache-hit': result.cache.hit ? '1' : '0',
        'x-cache-ttl': result.cache.ttl.toString(),
      });
      void reply.send(result.data);
    } catch (error) {
      if (error instanceof Error && error.message === 'siteId is required') {
        void reply.badRequest(error.message);
        return;
      }

      handleMatomoError(error, reply);
    }
  });

  app.post('/tools/GetMostPopularUrls', async (request, reply) => {
    if (!requireAuth(request, reply)) {
      return;
    }

    const parsed = GetMostPopularUrlsRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      void reply.badRequest('Invalid request body');
      return;
    }

    try {
      const siteId = resolveSiteId(env, parsed.data.siteId);
      const result = await reportingService.getMostPopularUrls({
        ...parsed.data,
        siteId,
      });

      void reply.headers({
        'x-cache-hit': result.cache.hit ? '1' : '0',
        'x-cache-ttl': result.cache.ttl.toString(),
      });
      if (result.pagination) {
        void reply.headers({
          'x-pagination-limit': result.pagination.limit.toString(),
          'x-pagination-page': result.pagination.page.toString(),
        });
      }
      void reply.send(result.data);
    } catch (error) {
      if (error instanceof Error && error.message === 'siteId is required') {
        void reply.badRequest(error.message);
        return;
      }

      handleMatomoError(error, reply);
    }
  });

  app.post('/tools/GetTopReferrers', async (request, reply) => {
    if (!requireAuth(request, reply)) {
      return;
    }

    const parsed = GetTopReferrersRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      void reply.badRequest('Invalid request body');
      return;
    }

    try {
      const siteId = resolveSiteId(env, parsed.data.siteId);
      const result = await reportingService.getTopReferrers({
        ...parsed.data,
        siteId,
      });

      void reply.headers({
        'x-cache-hit': result.cache.hit ? '1' : '0',
        'x-cache-ttl': result.cache.ttl.toString(),
      });
      if (result.pagination) {
        void reply.headers({
          'x-pagination-limit': result.pagination.limit.toString(),
          'x-pagination-page': result.pagination.page.toString(),
        });
      }
      void reply.send(result.data);
    } catch (error) {
      if (error instanceof Error && error.message === 'siteId is required') {
        void reply.badRequest(error.message);
        return;
      }

      handleMatomoError(error, reply);
    }
  });

  app.post('/tools/GetEvents', async (request, reply) => {
    if (!requireAuth(request, reply)) {
      return;
    }

    const parsed = GetEventsRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      void reply.badRequest('Invalid request body');
      return;
    }

    try {
      const siteId = resolveSiteId(env, parsed.data.siteId);
      const result = await reportingService.getEvents({
        ...parsed.data,
        siteId,
      });

      void reply.headers({
        'x-cache-hit': result.cache.hit ? '1' : '0',
        'x-cache-ttl': result.cache.ttl.toString(),
      });
      if (result.pagination) {
        void reply.headers({
          'x-pagination-limit': result.pagination.limit.toString(),
          'x-pagination-page': result.pagination.page.toString(),
        });
      }
      void reply.send(result.data);
    } catch (error) {
      if (error instanceof Error && error.message === 'siteId is required') {
        void reply.badRequest(error.message);
        return;
      }

      handleMatomoError(error, reply);
    }
  });

  const manifest = buildDiscoveryManifest({
    authType: env.OPAL_BEARER_TOKEN ? 'bearer' : 'none',
  });

  app.get('/.well-known/tools.json', async () => manifest);
  app.get('/discovery', async () => manifest);
}
