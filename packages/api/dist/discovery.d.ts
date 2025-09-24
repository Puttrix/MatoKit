export type AuthType = 'bearer' | 'none';
export interface DiscoveryOptions {
    authType: AuthType;
}
export declare function buildDiscoveryManifest({ authType }: DiscoveryOptions): {
    schemaVersion: string;
    service: {
        name: string;
        description: string;
        version: string;
    };
    auth: {
        type: AuthType;
    };
    tools: {
        type: string;
        function: {
            name: string;
            description: string;
            parameters: {
                type: string;
                properties: {
                    siteId: {
                        type: string;
                        description: string;
                    };
                    period: {
                        type: string;
                        enum: ("day" | "week" | "month" | "year" | "range")[];
                        description: string;
                    };
                    date: {
                        type: string;
                        description: string;
                    };
                    segment: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
            } | {
                type: string;
                properties: {
                    limit: {
                        type: string;
                        description: string;
                    };
                    flat: {
                        type: string;
                        description: string;
                    };
                    siteId: {
                        type: string;
                        description: string;
                    };
                    period: {
                        type: string;
                        enum: ("day" | "week" | "month" | "year" | "range")[];
                        description: string;
                    };
                    date: {
                        type: string;
                        description: string;
                    };
                    segment: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
            } | {
                type: string;
                properties: {
                    limit: {
                        type: string;
                        description: string;
                    };
                    siteId: {
                        type: string;
                        description: string;
                    };
                    period: {
                        type: string;
                        enum: ("day" | "week" | "month" | "year" | "range")[];
                        description: string;
                    };
                    date: {
                        type: string;
                        description: string;
                    };
                    segment: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
            } | {
                type: string;
                properties: {
                    category: {
                        type: string;
                        description: string;
                    };
                    action: {
                        type: string;
                        description: string;
                    };
                    name: {
                        type: string;
                        description: string;
                    };
                    limit: {
                        type: string;
                        description: string;
                    };
                    siteId: {
                        type: string;
                        description: string;
                    };
                    period: {
                        type: string;
                        enum: ("day" | "week" | "month" | "year" | "range")[];
                        description: string;
                    };
                    date: {
                        type: string;
                        description: string;
                    };
                    segment: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
            };
            returns: {
                type: string;
                properties: {
                    nb_visits: {
                        type: string;
                    };
                    nb_uniq_visitors: {
                        type: string;
                    };
                    nb_users: {
                        type: string;
                    };
                    nb_pageviews: {
                        type: string;
                    };
                    nb_actions: {
                        type: string;
                    };
                    sum_visit_length: {
                        type: string;
                    };
                    bounce_rate: {
                        type: string;
                    };
                    avg_time_on_site: {
                        type: string;
                    };
                };
                required: string[];
                items?: undefined;
            } | {
                type: string;
                items: {
                    type: string;
                    properties: {
                        label: {
                            type: string;
                        };
                        url: {
                            type: string;
                        };
                        nb_hits: {
                            type: string;
                        };
                        nb_visits: {
                            type: string;
                        };
                        sum_time_spent: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                properties?: undefined;
                required?: undefined;
            } | {
                type: string;
                items: {
                    type: string;
                    properties: {
                        label: {
                            type: string;
                        };
                        url: {
                            type: string;
                        };
                        referrer_type: {
                            type: string;
                        };
                        nb_visits: {
                            type: string;
                        };
                        nb_hits: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                properties?: undefined;
                required?: undefined;
            } | {
                type: string;
                items: {
                    type: string;
                    properties: {
                        label: {
                            type: string;
                        };
                        nb_events: {
                            type: string;
                        };
                        nb_visits: {
                            type: string;
                        };
                        nb_hits: {
                            type: string;
                        };
                        sum_event_value: {
                            type: string;
                        };
                        max_event_value: {
                            type: string;
                        };
                        min_event_value: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                properties?: undefined;
                required?: undefined;
            };
        };
        transport: {
            type: string;
            method: string;
            path: string;
        };
    }[];
};
//# sourceMappingURL=discovery.d.ts.map