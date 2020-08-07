export interface HubContainer {
    version: number;
    id: string;
    signature: string;
    content: Hub;
    status?: string;
    added?: Date;
    wellKnownUrl?: string;
    originalUrl?: string;
}

export interface Hub {
    identifier: string;
    height: number;
    name: string;
    shortname: string;
    alias: string;
    title: string;
    email: string;
    url: string;
    image: string;
    hubs: string[];
}
