import type { ZodType } from 'zod';
export type MatomoParamValue = string | number | boolean | null | undefined;
export interface MatomoClientConfig {
    baseUrl: string;
    tokenAuth: string;
    apiPath?: string;
    defaultParams?: Record<string, MatomoParamValue>;
    timeoutMs?: number;
    fetch?: typeof fetch;
}
export interface MatomoGetOptions<TResponse = unknown> {
    method: string;
    params?: Record<string, MatomoParamValue>;
    timeoutMs?: number;
    signal?: AbortSignal;
    schema?: ZodType<TResponse>;
}
export interface MatomoClient {
    get<TResponse = unknown>(options: MatomoGetOptions<TResponse>): Promise<TResponse>;
}
export declare function createMatomoClient(config: MatomoClientConfig): MatomoClient;
//# sourceMappingURL=client.d.ts.map