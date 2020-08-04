import { Link } from './link';

// export interface Identity {
//     id: string;
//     name: string;
//     shortname: string;
//     alias?: string;
//     title?: string;
//     email?: string;
//     published: boolean;
//     locked?: boolean;
//     links?: Link[];
//     time?: Date;
//     height: number;
//     signature?: string;
//     restorekey?: string;
// }

export interface IdentityContainer {
    version: number;
    id: string;
    signature: string;
    content: Identity;

    // Local custom values:
    status?: string;
    added?: Date;
    locked?: boolean;
    published: boolean;
    index: number; // Make sure we don't publish this, we don't want to expose the user's identity indexes.
}

export interface Identity {
    identifier: string;
    height: number;
    name: string;
    shortName: string;
    alias: string;
    title: string;
    email: string;
    url: string;
    image: string;
    hubs: string[];
}
