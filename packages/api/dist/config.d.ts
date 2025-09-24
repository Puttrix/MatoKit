import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    MATOMO_BASE_URL: z.ZodString;
    MATOMO_TOKEN: z.ZodString;
    DEFAULT_SITE_ID: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    OPAL_BEARER_TOKEN: z.ZodOptional<z.ZodString>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    HOST: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
export declare class EnvValidationError extends Error {
    readonly issues: unknown;
    constructor(issues: unknown);
}
export declare function loadEnv(overrides?: Record<string, unknown>): Env;
//# sourceMappingURL=config.d.ts.map