import { describe, expect, it } from 'vitest';
import { EventRowSchema, EventsSchema, KeyNumbersRowSchema, KeyNumbersSchema, PopularUrlRowSchema, PopularUrlsSchema, ReferrerRowSchema, TopReferrersSchema, } from './reporting';
describe('reporting schemas', () => {
    it('coerces numeric strings in key numbers rows', () => {
        const parsed = KeyNumbersRowSchema.parse({
            nb_visits: '10',
            nb_users: '5',
            nb_pageviews: '40',
            bounce_rate: '60.5',
        });
        expect(parsed).toMatchObject({
            nb_visits: 10,
            nb_users: 5,
            nb_pageviews: 40,
            bounce_rate: 60.5,
        });
    });
    it('accepts keyed key-number responses', () => {
        const parsed = KeyNumbersSchema.parse({
            '2024-03-17': {
                nb_visits: '12',
            },
        });
        const keyed = parsed;
        expect(keyed['2024-03-17'].nb_visits).toBe(12);
    });
    it('parses popular url rows', () => {
        const data = [
            {
                label: 'Homepage',
                url: 'https://example.com/',
                nb_hits: '100',
                nb_visits: '80',
                sum_time_spent: '2400',
            },
        ];
        const parsed = PopularUrlsSchema.parse(data);
        expect(parsed[0]).toMatchObject({
            nb_hits: 100,
            nb_visits: 80,
            sum_time_spent: 2400,
        });
    });
    it('parses top referrers rows', () => {
        const parsed = TopReferrersSchema.parse([
            {
                label: 'example.com',
                nb_visits: '20',
            },
        ]);
        expect(parsed[0].nb_visits).toBe(20);
    });
    it('parses events', () => {
        const parsed = EventsSchema.parse([
            {
                label: 'signup',
                nb_events: '15',
                sum_event_value: '30',
            },
        ]);
        expect(parsed[0]).toMatchObject({
            nb_events: 15,
            sum_event_value: 30,
        });
    });
    it('retains unknown properties via passthrough', () => {
        const urlRow = PopularUrlRowSchema.parse({
            label: 'Homepage',
            nb_hits: '5',
            custom: 'value',
        });
        expect(urlRow.custom).toBe('value');
        const refRow = ReferrerRowSchema.parse({
            label: 'utm_campaign',
            nb_visits: '2',
            extra: 123,
        });
        expect(refRow.extra).toBe(123);
        const eventRow = EventRowSchema.parse({
            label: 'download',
            nb_events: '4',
            nested: { some: 'value' },
        });
        expect(eventRow.nested?.some).toBe('value');
    });
});
//# sourceMappingURL=reporting.test.js.map