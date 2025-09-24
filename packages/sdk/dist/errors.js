export class MatomoClientError extends Error {
    code;
    status;
    details;
    constructor(message, options) {
        super(message, { cause: options.cause });
        this.name = 'MatomoClientError';
        this.code = options.code;
        this.status = options.status;
        this.details = options.details;
    }
}
//# sourceMappingURL=errors.js.map