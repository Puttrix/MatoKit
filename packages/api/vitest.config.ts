import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const sdkSrc = fileURLToPath(new URL('../sdk/src/index.ts', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@matokit/sdk': sdkSrc,
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      enabled: false,
    },
  },
});
