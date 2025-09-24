import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import {
  createMatomoClient,
  type MatomoClient,
  MatomoTrackingClient,
  ReportingService,
} from '@matokit/sdk';
import fastify, { type FastifyInstance } from 'fastify';

import type { Env } from './config.js';
import { loadEnv } from './config.js';
import { registerReportingRoutes } from './routes/reporting.js';
import { registerTrackingRoutes } from './routes/tracking.js';

export interface BuildServerOptions {
  env?: Env;
  matomoClient?: MatomoClient;
  trackingClient?: MatomoTrackingClient;
}

export interface ServerBundle {
  app: FastifyInstance;
  env: Env;
}

export async function buildServer(options: BuildServerOptions = {}): Promise<ServerBundle> {
  const env = options.env ?? loadEnv();

  const matomoClient =
    options.matomoClient ??
    createMatomoClient({
      baseUrl: env.MATOMO_BASE_URL,
      tokenAuth: env.MATOMO_TOKEN,
    });

  const reportingService = new ReportingService(matomoClient, {
    ttlMs: 60_000,
    maxSize: 200,
  });

  const trackingClient =
    options.trackingClient ??
    new MatomoTrackingClient({
      baseUrl: env.MATOMO_BASE_URL,
      tokenAuth: env.MATOMO_TOKEN,
      defaultSiteId: env.DEFAULT_SITE_ID,
    });

  const app = fastify({
    logger: true,
  });

  await app.register(helmet, { global: true });
  await app.register(cors, {
    origin: false,
  });
  await app.register(sensible);

  app.get('/health', async () => ({ status: 'ok' }));
  app.get('/', async () => ({
    status: 'ok',
    message: 'MatomoTools API is running. See /discovery for tool definitions.',
  }));

  await registerReportingRoutes({ app, env, reportingService });
  await registerTrackingRoutes({ app, env, trackingClient });

  return { app, env };
}

export async function startServer(): Promise<void> {
  const { app, env } = await buildServer();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info({ port: env.PORT, host: env.HOST }, 'API server started');
  } catch (error) {
    app.log.error(error, 'Failed to start API server');
    await app.close();
    process.exit(1);
  }
}
