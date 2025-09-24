import { z } from 'zod';
export declare const KeyNumbersRowSchema: z.ZodObject<{
    nb_visits: z.ZodCoercedNumber<unknown>;
    nb_uniq_visitors: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_users: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_pageviews: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_actions: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sum_visit_length: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    bounce_rate: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    avg_time_on_site: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$loose>;
export declare const KeyNumbersSchema: z.ZodUnion<readonly [z.ZodObject<{
    nb_visits: z.ZodCoercedNumber<unknown>;
    nb_uniq_visitors: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_users: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_pageviews: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_actions: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sum_visit_length: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    bounce_rate: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    avg_time_on_site: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$loose>, z.ZodArray<z.ZodObject<{
    nb_visits: z.ZodCoercedNumber<unknown>;
    nb_uniq_visitors: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_users: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_pageviews: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_actions: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sum_visit_length: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    bounce_rate: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    avg_time_on_site: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$loose>>, z.ZodRecord<z.ZodString, z.ZodObject<{
    nb_visits: z.ZodCoercedNumber<unknown>;
    nb_uniq_visitors: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_users: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_pageviews: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_actions: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sum_visit_length: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    bounce_rate: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    avg_time_on_site: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$loose>>]>;
export type KeyNumbersRow = z.infer<typeof KeyNumbersRowSchema>;
export type KeyNumbersResponse = z.infer<typeof KeyNumbersSchema>;
export declare const PopularUrlRowSchema: z.ZodObject<{
    label: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    nb_hits: z.ZodCoercedNumber<unknown>;
    nb_visits: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sum_time_spent: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$loose>;
export declare const PopularUrlsSchema: z.ZodArray<z.ZodObject<{
    label: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    nb_hits: z.ZodCoercedNumber<unknown>;
    nb_visits: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sum_time_spent: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$loose>>;
export type PopularUrlRow = z.infer<typeof PopularUrlRowSchema>;
export declare const ReferrerRowSchema: z.ZodObject<{
    label: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    referrer_type: z.ZodOptional<z.ZodString>;
    nb_visits: z.ZodCoercedNumber<unknown>;
    nb_hits: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$loose>;
export declare const TopReferrersSchema: z.ZodArray<z.ZodObject<{
    label: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    referrer_type: z.ZodOptional<z.ZodString>;
    nb_visits: z.ZodCoercedNumber<unknown>;
    nb_hits: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$loose>>;
export type ReferrerRow = z.infer<typeof ReferrerRowSchema>;
export declare const EventRowSchema: z.ZodObject<{
    label: z.ZodString;
    nb_events: z.ZodCoercedNumber<unknown>;
    nb_visits: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_hits: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sum_event_value: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    max_event_value: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    min_event_value: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$loose>;
export declare const EventsSchema: z.ZodArray<z.ZodObject<{
    label: z.ZodString;
    nb_events: z.ZodCoercedNumber<unknown>;
    nb_visits: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    nb_hits: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sum_event_value: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    max_event_value: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    min_event_value: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$loose>>;
export type EventRow = z.infer<typeof EventRowSchema>;
export declare const MatomoNumericSchema: z.ZodCoercedNumber<unknown>;
//# sourceMappingURL=reporting.d.ts.map