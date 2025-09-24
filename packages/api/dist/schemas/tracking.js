import { z } from 'zod';
const timestampSchema = z
    .union([z.number(), z.date()])
    .optional()
    .transform((value) => value);
const preprocessTimestamp = z.preprocess((value) => {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value === 'number' || value instanceof Date) {
        return value;
    }
    if (typeof value === 'string') {
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) {
            return numeric;
        }
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            return date;
        }
    }
    return undefined;
}, timestampSchema);
const baseTrackingSchema = z.object({
    siteId: z.number().int().positive().optional(),
    uid: z.string().optional(),
    pvId: z.string().optional(),
    ts: preprocessTimestamp,
});
export const TrackPageviewSchema = baseTrackingSchema.extend({
    url: z.string().url(),
    title: z.string().optional(),
});
export const TrackEventSchema = baseTrackingSchema.extend({
    category: z.string().min(1),
    action: z.string().min(1),
    name: z.string().optional(),
    value: z.number().optional(),
});
export const TrackGoalSchema = baseTrackingSchema.extend({
    idGoal: z.number().int().positive(),
    revenue: z.number().optional(),
});
//# sourceMappingURL=tracking.js.map