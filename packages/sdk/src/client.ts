import type { ZodType } from 'zod';

import { MatomoClientError } from './errors';

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

const MATOMO_DEFAULT_API_PATH = 'index.php';
const MATOMO_DEFAULT_FORMAT = 'json';

function buildSearchParams(
  config: MatomoClientConfig,
  options: MatomoGetOptions,
): URLSearchParams {
  const params = new URLSearchParams();

  const applyParams = (input?: Record<string, MatomoParamValue>) => {
    if (!input) {
      return;
    }
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined || value === null) {
        continue;
      }
      params.set(key, String(value));
    }
  };

  applyParams(config.defaultParams);

  applyParams({
    module: 'API',
    format: MATOMO_DEFAULT_FORMAT,
    token_auth: config.tokenAuth,
  });

  if (!options.method) {
    throw new MatomoClientError('Matomo method is required', {
      code: 'matomo_error',
    });
  }

  params.set('method', options.method);
  applyParams(options.params);

  return params;
}

function createTimeoutController(
  timeoutMs?: number,
  externalSignal?: AbortSignal,
): { signal?: AbortSignal; clear(): void } {
  if (!timeoutMs && !externalSignal) {
    return {
      signal: undefined,
      clear: () => undefined,
    };
  }

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener(
        'abort',
        () => controller.abort(externalSignal.reason),
        { once: true },
      );
    }
  }

  if (timeoutMs) {
    timeoutId = setTimeout(() => {
      const timeoutError = new Error('Matomo request timed out');
      timeoutError.name = 'AbortError';
      controller.abort(timeoutError);
    }, timeoutMs);
  }

  return {
    signal: controller.signal,
    clear: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  };
}

function parseResponseBody(bodyText: string): unknown {
  if (!bodyText) {
    return null;
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return bodyText;
  }
}

export function createMatomoClient(config: MatomoClientConfig): MatomoClient {
  const fetchImpl = config.fetch ?? globalThis.fetch;

  if (typeof fetchImpl !== 'function') {
    throw new MatomoClientError('Fetch API is not available', {
      code: 'no_fetch',
    });
  }

  const apiPath = config.apiPath ?? MATOMO_DEFAULT_API_PATH;

  return {
    async get<TResponse = unknown>(options: MatomoGetOptions<TResponse>): Promise<TResponse> {
      const url = new URL(apiPath, config.baseUrl);
      const searchParams = buildSearchParams(config, options);
      url.search = searchParams.toString();

      const timeoutMs = options.timeoutMs ?? config.timeoutMs;
      const { signal, clear } = createTimeoutController(timeoutMs, options.signal);

      try {
        const response = await fetchImpl(url.toString(), {
          method: 'GET',
          signal,
          headers: {
            accept: 'application/json',
          },
        });

        const bodyText = await response.text();
        const data = parseResponseBody(bodyText);

        if (!response.ok) {
          throw new MatomoClientError(`Matomo HTTP error: ${response.status}`, {
            code: 'http_error',
            status: response.status,
            details: data ?? bodyText,
          });
        }

        if (
          data &&
          typeof data === 'object' &&
          'result' in data &&
          (data as Record<string, unknown>).result === 'error'
        ) {
          const message =
            typeof (data as Record<string, unknown>).message === 'string'
              ? (data as Record<string, unknown>).message
              : 'Unknown Matomo error';
          throw new MatomoClientError(`Matomo API error: ${message}`, {
            code: 'matomo_error',
            details: data,
          });
        }

        if (options.schema) {
          try {
            return options.schema.parse(data);
          } catch (validationError) {
            throw new MatomoClientError('Matomo response validation failed', {
              code: 'validation_error',
              details: validationError,
              cause: validationError,
            });
          }
        }

        return data as TResponse;
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === 'AbortError'
        ) {
          throw new MatomoClientError('Matomo request timed out', {
            code: 'timeout',
            details: { method: options.method },
            cause: error,
          });
        }

        if (error instanceof MatomoClientError) {
          throw error;
        }

        throw new MatomoClientError('Matomo request failed', {
          code: 'http_error',
          details: error,
          cause: error,
        });
      } finally {
        clear();
      }
    },
  };
}
