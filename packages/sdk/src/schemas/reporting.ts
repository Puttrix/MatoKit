import { z } from 'zod';

function parseDurationString(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed.includes(':')) {
    return undefined;
  }

  const segments = trimmed.split(':');
  if (segments.length < 2 || segments.length > 3) {
    return undefined;
  }

  const numbers = segments.map((segment) => Number(segment));
  if (numbers.some((segment) => Number.isNaN(segment) || segment < 0)) {
    return undefined;
  }

  if (segments.length === 2) {
    const [minutes, seconds] = numbers;
    return minutes * 60 + seconds;
  }

  const [hours, minutes, seconds] = numbers;
  return hours * 3600 + minutes * 60 + seconds;
}

function normalizeMatomoNumeric(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return trimmed;
    }

    const duration = parseDurationString(trimmed);
    if (duration !== undefined) {
      return duration;
    }

    const normalized = trimmed.replace(/,/g, '');
    const parsed = Number(normalized);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return value;
}

const finiteNumber = z
  .preprocess(normalizeMatomoNumeric, z.number().refine((value) => Number.isFinite(value), {
    message: 'Value must be a finite number',
  }));

const bounceRateNumber = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value.trim().replace(/%$/, '');
  }
  return value;
}, finiteNumber);

export const KeyNumbersRowSchema = z
  .object({
    nb_visits: finiteNumber,
    nb_uniq_visitors: finiteNumber.optional(),
    nb_users: finiteNumber.optional(),
    nb_pageviews: finiteNumber.optional(),
    nb_actions: finiteNumber.optional(),
    sum_visit_length: finiteNumber.optional(),
    bounce_rate: bounceRateNumber.optional(),
    avg_time_on_site: finiteNumber.optional(),
  })
  .passthrough();

export const KeyNumbersSchema = z.union([
  KeyNumbersRowSchema,
  z.array(KeyNumbersRowSchema),
  z.record(z.string(), KeyNumbersRowSchema),
]);

export type KeyNumbersRow = z.infer<typeof KeyNumbersRowSchema>;
export type KeyNumbersResponse = z.infer<typeof KeyNumbersSchema>;

export const PopularUrlRowSchema = z
  .object({
    label: z.string(),
    url: z.string().optional(),
    nb_hits: finiteNumber,
    nb_visits: finiteNumber.optional(),
    sum_time_spent: finiteNumber.optional(),
  })
  .passthrough();

export const PopularUrlsSchema = z.array(PopularUrlRowSchema);
export type PopularUrlRow = z.infer<typeof PopularUrlRowSchema>;

export const ReferrerRowSchema = z
  .object({
    label: z.string(),
    url: z.string().optional(),
    referrer_type: z.string().optional(),
    nb_visits: finiteNumber,
    nb_hits: finiteNumber.optional(),
  })
  .passthrough();

export const TopReferrersSchema = z.array(ReferrerRowSchema);
export type ReferrerRow = z.infer<typeof ReferrerRowSchema>;

export const EventRowSchema = z
  .object({
    label: z.string(),
    nb_events: finiteNumber,
    nb_visits: finiteNumber.optional(),
    nb_hits: finiteNumber.optional(),
    sum_event_value: finiteNumber.optional(),
    max_event_value: finiteNumber.optional(),
    min_event_value: finiteNumber.optional(),
  })
  .passthrough();

export const EventsSchema = z.array(EventRowSchema);
export type EventRow = z.infer<typeof EventRowSchema>;

export const MatomoNumericSchema = finiteNumber;
