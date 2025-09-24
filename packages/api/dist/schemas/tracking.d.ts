import { z } from 'zod';
export declare const TrackPageviewSchema: z.ZodObject<{
    siteId: z.ZodOptional<z.ZodNumber>;
    uid: z.ZodOptional<z.ZodString>;
    pvId: z.ZodOptional<z.ZodString>;
    ts: z.ZodPipe<z.ZodTransform<number | Date | undefined, unknown>, z.ZodPipe<z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodDate]>>, z.ZodTransform<number | Date | undefined, number | Date | undefined>>>;
    url: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const TrackEventSchema: z.ZodObject<{
    siteId: z.ZodOptional<z.ZodNumber>;
    uid: z.ZodOptional<z.ZodString>;
    pvId: z.ZodOptional<z.ZodString>;
    ts: z.ZodPipe<z.ZodTransform<number | Date | undefined, unknown>, z.ZodPipe<z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodDate]>>, z.ZodTransform<number | Date | undefined, number | Date | undefined>>>;
    category: z.ZodString;
    action: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const TrackGoalSchema: z.ZodObject<{
    siteId: z.ZodOptional<z.ZodNumber>;
    uid: z.ZodOptional<z.ZodString>;
    pvId: z.ZodOptional<z.ZodString>;
    ts: z.ZodPipe<z.ZodTransform<number | Date | undefined, unknown>, z.ZodPipe<z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodDate]>>, z.ZodTransform<number | Date | undefined, number | Date | undefined>>>;
    idGoal: z.ZodNumber;
    revenue: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=tracking.d.ts.map