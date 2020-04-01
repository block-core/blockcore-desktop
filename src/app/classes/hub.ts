export interface Hub {
    id: string;
    url: string;
    wellKnownUrl?: string;
    name: string;
    icon?: string;
    added?: Date;
    time?: Date;
    signature?: string;
}
