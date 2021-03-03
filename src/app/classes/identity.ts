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
    identifier: string = null;
    iat: number = null;
    '@type': string = null;
    '@state' = 0;

    constructor(type: string) {
        this['@type'] = type;
    }
}

// export class Signature {

//     constructor(identity: string = null, value: string = null) {
//         this.identity = identity;
//         this.value = value;
//     }

//     type = 'sha256-ecdsa-secp256k1-v1';

//     identity: string = null;

//     value: string = null;
// }

export class Identity extends EntityBase {
    name: string = null;
    shortname: string = null;
    alias: string = null;
    title: string = null;
    email: string = null;
    url: string = null;
    image: string = null;
    hubs: string[] = null;

    constructor() {
        super('identity');
    }
}

export class IdentityContainer {
    version: number;
    id: string;

    header: string;
    signature: string;
    payload: string;

    content: Identity;

    // Local custom values:
    status?: string;
    added?: Date;
    locked?: boolean;
    published: boolean;
    publish: boolean;
    index: number; // Make sure we don't publish this, we don't want to expose the user's identity indexes.

    constructor(identity: Identity) {
        this.id = 'did:is:' + identity.identifier;
        this.content = identity;
        this.version = 4;
    }
}
