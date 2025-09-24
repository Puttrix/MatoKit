export type MatomoClientErrorCode =
  | 'timeout'
  | 'http_error'
  | 'matomo_error'
  | 'validation_error'
  | 'tracking_error'
  | 'no_fetch';

export interface MatomoClientErrorOptions {
  code: MatomoClientErrorCode;
  status?: number;
  details?: unknown;
  cause?: unknown;
}

export class MatomoClientError extends Error {
  public readonly code: MatomoClientErrorCode;

  public readonly status?: number;

  public readonly details?: unknown;

  constructor(message: string, options: MatomoClientErrorOptions) {
    super(message, { cause: options.cause });
    this.name = 'MatomoClientError';
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}
