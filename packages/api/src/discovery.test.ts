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

    expect(manifest.tools).toHaveLength(4);

    const keyNumbers = manifest.tools.find((tool) => tool.name === 'GetKeyNumbers');
    expect(keyNumbers).toMatchObject({
      type: 'http',
      method: 'POST',
      path: '/tools/GetKeyNumbers',
    });
    expect(keyNumbers?.inputSchema).toMatchObject({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      required: ['period', 'date'],
    });
    expect(keyNumbers?.outputSchema).toMatchObject({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      required: ['nb_visits'],
    });

    const events = manifest.tools.find((tool) => tool.name === 'GetEvents');
    expect(events?.inputSchema?.properties).toMatchObject({
      category: { type: 'string' },
      action: { type: 'string' },
      name: { type: 'string' },
    });
    expect(events?.outputSchema).toMatchObject({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'array',
    });
  });

  it('reflects unauthenticated deployments', () => {
    const manifest = buildDiscoveryManifest({ authType: 'none' });

    expect(manifest.auth).toStrictEqual({ type: 'none' });
  });
});
