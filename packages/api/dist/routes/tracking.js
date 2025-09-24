import { TrackEventSchema, TrackGoalSchema, TrackPageviewSchema, } from '../schemas/tracking';
function ensureAuthorized(env, request, reply) {
    if (!env.OPAL_BEARER_TOKEN) {
        return true;
    }
    const header = request.headers.authorization;
    const expected = `Bearer ${env.OPAL_BEARER_TOKEN}`;
    if (header !== expected) {
        void reply.unauthorized('Bearer token required');
        return false;
    }
    return true;
}
export async function registerTrackingRoutes({ app, env, trackingClient, }) {
    const guard = (request, reply) => ensureAuthorized(env, request, reply);
    app.post('/track/Pageview', async (request, reply) => {
        if (!guard(request, reply)) {
            return;
        }
        const parsed = TrackPageviewSchema.safeParse(request.body);
        if (!parsed.success) {
            void reply.badRequest('Invalid request body');
            return;
        }
        try {
            await trackingClient.trackPageview(parsed.data);
            void reply.status(202).send({ status: 'queued' });
        }
        catch (error) {
            request.log.error(error, 'trackPageview failed');
            void reply.badGateway('Matomo tracking failed');
        }
    });
    app.post('/track/Event', async (request, reply) => {
        if (!guard(request, reply)) {
            return;
        }
        const parsed = TrackEventSchema.safeParse(request.body);
        if (!parsed.success) {
            void reply.badRequest('Invalid request body');
            return;
        }
        try {
            await trackingClient.trackEvent(parsed.data);
            void reply.status(202).send({ status: 'queued' });
        }
        catch (error) {
            request.log.error(error, 'trackEvent failed');
            void reply.badGateway('Matomo tracking failed');
        }
    });
    app.post('/track/Goal', async (request, reply) => {
        if (!guard(request, reply)) {
            return;
        }
        const parsed = TrackGoalSchema.safeParse(request.body);
        if (!parsed.success) {
            void reply.badRequest('Invalid request body');
            return;
        }
        try {
            await trackingClient.trackGoal(parsed.data);
            void reply.status(202).send({ status: 'queued' });
        }
        catch (error) {
            request.log.error(error, 'trackGoal failed');
            void reply.badGateway('Matomo tracking failed');
        }
    });
}
//# sourceMappingURL=tracking.js.map