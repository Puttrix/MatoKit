import { describe, expect, it } from 'vitest';

import { buildDiscoveryManifest } from './discovery.js';

describe('buildDiscoveryManifest', () => {
  it('emits an Opal Tools SDK compatible manifest for all tools', () => {
    const manifest = buildDiscoveryManifest({ authType: 'bearer' });

    expect(manifest).toMatchObject({
      schemaVersion: '1',
      service: {
        name: 'MatomoTools',
        description: 'LLM-callable endpoints for Matomo analytics',
        version: '0.1.0',
      },
      auth: { type: 'bearer' },
    });

    expect(manifest.functions).toHaveLength(4);

    const keyNumbers = manifest.functions.find((fn) => fn.name === 'GetKeyNumbers');
    expect(keyNumbers).toMatchObject({
      endpoint: '/tools/GetKeyNumbers',
      http_method: 'POST',
    });
    expect(keyNumbers?.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'period', required: true }),
        expect.objectContaining({ name: 'date', required: true }),
        expect.objectContaining({ name: 'segment', required: false }),
      ]),
    );

    const events = manifest.functions.find((fn) => fn.name === 'GetEvents');
    expect(events?.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'category', required: false }),
        expect.objectContaining({ name: 'action', required: false }),
        expect.objectContaining({ name: 'name', required: false }),
      ]),
    );
  });

  it('reflects unauthenticated deployments', () => {
    const manifest = buildDiscoveryManifest({ authType: 'none' });

    expect(manifest.auth).toStrictEqual({ type: 'none' });
  });
});
