import { type MatomoClient, MatomoTrackingClient } from '@matokit/sdk';
import { type FastifyInstance } from 'fastify';
import type { Env } from './config';
export interface BuildServerOptions {
    env?: Env;
    matomoClient?: MatomoClient;
    trackingClient?: MatomoTrackingClient;
}
export interface ServerBundle {
    app: FastifyInstance;
    env: Env;
}
export declare function buildServer(options?: BuildServerOptions): Promise<ServerBundle>;
export declare function startServer(): Promise<void>;
//# sourceMappingURL=server.d.ts.map