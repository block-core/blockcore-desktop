export interface Hub {
    id: string;
    url: string;
    wellKnownUrl?: string;
    name: string;
    icon?: string;
    time?: Date;
    signature?: string;
}
