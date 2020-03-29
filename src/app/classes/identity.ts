export interface Identity {
    id: string;
    name: string;
    alias: string;
    title: string;
    published: boolean;
    locked?: boolean;
    url?: string;
    icon?: string;
    time?: Date;
    signature?: string;
}
