import { afterEach, describe, expect, it } from 'vitest';

import { buildServer } from './server.js';

const baseEnv = {
  NODE_ENV: 'test' as const,
  MATOMO_BASE_URL: 'https://analytics.example.com',
  MATOMO_TOKEN: 'token',
  PORT: 4000,
  HOST: '127.0.0.1',
};

let closeFn: (() => Promise<void>) | undefined;

afterEach(async () => {
  if (closeFn) {
    await closeFn();
    closeFn = undefined;
  }
});

describe('buildServer', () => {
  it('registers health endpoint', async () => {
    const { app } = await buildServer({ env: baseEnv });
    closeFn = () => app.close();

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});
