import { ReportingService } from '@matokit/sdk';
import type { FastifyInstance } from 'fastify';
import type { Env } from '../config';
export interface RegisterReportingRoutesOptions {
    app: FastifyInstance;
    env: Env;
    reportingService: ReportingService;
}
export declare function registerReportingRoutes({ app, env, reportingService, }: RegisterReportingRoutesOptions): Promise<void>;
//# sourceMappingURL=reporting.d.ts.map