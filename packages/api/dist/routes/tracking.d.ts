import { MatomoTrackingClient } from '@matokit/sdk';
import type { FastifyInstance } from 'fastify';
import type { Env } from '../config.js';
export interface RegisterTrackingRoutesOptions {
    app: FastifyInstance;
    env: Env;
    trackingClient: MatomoTrackingClient;
}
export declare function registerTrackingRoutes({ app, env, trackingClient, }: RegisterTrackingRoutesOptions): Promise<void>;
//# sourceMappingURL=tracking.d.ts.map