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

export class EntityBase {

    constructor(type: string)
    {
        this['@type'] = type;
    }

    identifier: string = null;
    height: number = null;
    '@type': string = null;
}

export class Identity extends EntityBase {

    constructor() {
        super('identity');
    }

    name: string = null;
    shortname: string = null;
    alias: string = null;
    title: string = null;
    email: string = null;
    url: string = null;
    image: string = null;
    hubs: string[] = null;
}

export class IdentityContainer {

    constructor(identity: Identity) {
        this.id = identity['@type'] + '/' + identity.identifier;
        this.content = identity;
        this.version = 2;
    }

    version: number;
    id: string;
    signature: string;
    content: Identity;

    // Local custom values:
    status?: string;
    added?: Date;
    locked?: boolean;
    published: boolean;
    publish: boolean;
    index: number; // Make sure we don't publish this, we don't want to expose the user's identity indexes.
}
