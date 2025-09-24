import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MATOMO_BASE_URL: z.string().url(),
  MATOMO_TOKEN: z.string().min(1, 'MATOMO_TOKEN is required'),
  DEFAULT_SITE_ID: z.coerce.number().int().positive().optional(),
  OPAL_BEARER_TOKEN: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
});

export type Env = z.infer<typeof envSchema>;

export class EnvValidationError extends Error {
  constructor(public readonly issues: unknown) {
    super('Invalid environment configuration');
    this.name = 'EnvValidationError';
  }
}

export function loadEnv(overrides: Record<string, unknown> = {}): Env {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    MATOMO_BASE_URL: process.env.MATOMO_BASE_URL,
    MATOMO_TOKEN: process.env.MATOMO_TOKEN,
    DEFAULT_SITE_ID: process.env.DEFAULT_SITE_ID,
    OPAL_BEARER_TOKEN: process.env.OPAL_BEARER_TOKEN,
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    ...overrides,
  });

  if (!parsed.success) {
    throw new EnvValidationError(parsed.error.flatten());
  }

  return parsed.data;
}
