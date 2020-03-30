import { Link } from './link';

// TODO: Consider adding a field to indicate if this profile has an image. That will save some queries to the hubs.
export interface Identity {
    id: string;
    name: string;
    shortname: string;
    alias?: string;
    title?: string;
    email?: string;
    published: boolean;
    locked?: boolean;
    links?: Link[];
    time?: Date;
    signature?: string;
    restorekey?: string;
    index?: number;
}
