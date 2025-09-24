import { describe, expect, it } from 'vitest';

import { EnvValidationError, loadEnv } from './config.js';

describe('loadEnv', () => {
  const baseConfig = {
    NODE_ENV: 'test',
    MATOMO_BASE_URL: 'https://analytics.example.com',
    MATOMO_TOKEN: 'token',
    PORT: '4000',
    HOST: '127.0.0.1',
  } satisfies Record<string, unknown>;

  it('parses configuration values with defaults', () => {
    const env = loadEnv(baseConfig);

    expect(env.PORT).toBe(4000);
    expect(env.HOST).toBe('127.0.0.1');
    expect(env.NODE_ENV).toBe('test');
  });

  it('coerces numeric DEFAULT_SITE_ID', () => {
    const env = loadEnv({ ...baseConfig, DEFAULT_SITE_ID: '3' });
    expect(env.DEFAULT_SITE_ID).toBe(3);
  });

  it('throws EnvValidationError when required vars missing', () => {
    expect(() => loadEnv({})).toThrow(EnvValidationError);
  });
});
