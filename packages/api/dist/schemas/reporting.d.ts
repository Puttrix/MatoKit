import { z } from 'zod';
export declare const PERIODS: readonly ["day", "week", "month", "year", "range"];
export declare const PeriodSchema: z.ZodEnum<{
    day: "day";
    week: "week";
    month: "month";
    year: "year";
    range: "range";
}>;
export declare const BaseReportingRequestSchema: z.ZodObject<{
    siteId: z.ZodOptional<z.ZodNumber>;
    period: z.ZodEnum<{
        day: "day";
        week: "week";
        month: "month";
        year: "year";
        range: "range";
    }>;
    date: z.ZodString;
    segment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const GetKeyNumbersRequestSchema: z.ZodObject<{
    siteId: z.ZodOptional<z.ZodNumber>;
    period: z.ZodEnum<{
        day: "day";
        week: "week";
        month: "month";
        year: "year";
        range: "range";
    }>;
    date: z.ZodString;
    segment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const GetMostPopularUrlsRequestSchema: z.ZodObject<{
    siteId: z.ZodOptional<z.ZodNumber>;
    period: z.ZodEnum<{
        day: "day";
        week: "week";
        month: "month";
        year: "year";
        range: "range";
    }>;
    date: z.ZodString;
    segment: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    flat: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const GetTopReferrersRequestSchema: z.ZodObject<{
    siteId: z.ZodOptional<z.ZodNumber>;
    period: z.ZodEnum<{
        day: "day";
        week: "week";
        month: "month";
        year: "year";
        range: "range";
    }>;
    date: z.ZodString;
    segment: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const GetEventsRequestSchema: z.ZodObject<{
    siteId: z.ZodOptional<z.ZodNumber>;
    period: z.ZodEnum<{
        day: "day";
        week: "week";
        month: "month";
        year: "year";
        range: "range";
    }>;
    date: z.ZodString;
    segment: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=reporting.d.ts.map