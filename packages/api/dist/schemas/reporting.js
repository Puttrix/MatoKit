import { z } from 'zod';
export const PERIODS = ['day', 'week', 'month', 'year', 'range'];
export const PeriodSchema = z.enum(PERIODS);
export const BaseReportingRequestSchema = z.object({
    siteId: z.number().int().positive().optional(),
    period: PeriodSchema,
    date: z.string().min(1, 'date is required'),
    segment: z.string().optional(),
});
export const GetKeyNumbersRequestSchema = BaseReportingRequestSchema;
export const GetMostPopularUrlsRequestSchema = BaseReportingRequestSchema.extend({
    limit: z.number().int().positive().max(1000).optional(),
    flat: z.boolean().optional(),
});
export const GetTopReferrersRequestSchema = BaseReportingRequestSchema.extend({
    limit: z.number().int().positive().max(1000).optional(),
});
export const GetEventsRequestSchema = BaseReportingRequestSchema.extend({
    category: z.string().optional(),
    action: z.string().optional(),
    name: z.string().optional(),
    limit: z.number().int().positive().max(1000).optional(),
});
//# sourceMappingURL=reporting.js.map