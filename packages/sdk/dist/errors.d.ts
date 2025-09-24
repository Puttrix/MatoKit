export type MatomoClientErrorCode = 'timeout' | 'http_error' | 'matomo_error' | 'validation_error' | 'tracking_error' | 'no_fetch';
export interface MatomoClientErrorOptions {
    code: MatomoClientErrorCode;
    status?: number;
    details?: unknown;
    cause?: unknown;
}
export declare class MatomoClientError extends Error {
    readonly code: MatomoClientErrorCode;
    readonly status?: number;
    readonly details?: unknown;
    constructor(message: string, options: MatomoClientErrorOptions);
}
//# sourceMappingURL=errors.d.ts.map