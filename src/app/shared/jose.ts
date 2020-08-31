import base64url from 'base64url'; // Should we replicate this code to avoid dependency? It's a very simple utility.
import utf8 from 'utf8';
import * as city from 'city-lib';
import * as blockcoreMessage from '@blockcore/message';

/*
    Blockcore-Jose-JS
    Blockcore Javascript Object Signing and Encryption (JOSE) for JavaScript

    NOTE: Currently only supports ES256K, refer to other implementations (e.g. jsrsasign) for additional algorithms.

    - Encodes either a JavaScript object or string into a JWT.
    - Supports requirement of signature, and reading the key from "kid" in header.

    Future improvements:

    - JSON Web Encryption (JWE)
    - JSON Web Key (JWK)
    - JSON Web Key Set (JWKS)
    - JSON Web Signature (JWS) (DONE)
    - JSON Web Token (JWT)

    .NET version: https://github.com/block-core/blockcore-jose
*/

export class Jws {

    private static identityNetwork = {
        pubKeyHash: 55,
        scriptHash: 117
    };

    public static encode(payload: string | any, identity: string | any): string {
        let payloadText;

        if (typeof payload === 'string' || payload instanceof String) {
            payloadText = payload;
        }
        else {
            payloadText = JSON.stringify(payload);
        }

        const publicKey = this.getAddress(identity, this.identityNetwork);

        const header = {
            alg: 'ES256K', // We currently only support ES256K.
            typ: 'JWT',
            kid: publicKey
        };

        const headerText = JSON.stringify(header);

        // Header is first encoded to UTF-8 then base64url encoded, while payload is encoded directly to base64url. This is according to the specification.
        let message = base64url.encode(utf8.encode(headerText)) + '.' + base64url.encode(payloadText);

        const signature = blockcoreMessage.sign(message, identity.privateKey, true, '');

        message += '.' + base64url.encode(signature);

        return message;
    }

    public static sign(payload: string | any, secret: string): string {
        let payloadText;

        if (typeof payload === 'string' || payload instanceof String) {
            payloadText = payload;
        }
        else {
            payloadText = JSON.stringify(payload);
        }

        const header = {
            alg: 'ES256K', // We currently only support ES256K.
            typ: 'JWT',
            kid: secret
        };

        const headerText = JSON.stringify(header);

        // Header is first encoded to UTF-8 then base64url encoded, while payload is encoded directly to base64url. This is according to the specification.
        const message = base64url.encode(utf8.encode(headerText)) + '.' + base64url.encode(payloadText) + '.';

        return message;
    }

    public static decode(payload: string, header: boolean = false, requireSignature: boolean = false): string {

        const matchResult = payload.match(/^([^.]+)\.([^.]+)\.([^.]+)$/);

        if (matchResult == null) {
            throw new Error('JWS payload is not in correct format of \'Header.Payload.Signature\'.');
        }

        const values = payload.split('.');

        // Validate that there is a signature and that it's valid.
        if (requireSignature === true) {

        }

        if (header === true) {
            const decoded = base64url.decode(utf8.decode(values[0]));
            const json = JSON.parse(decoded);
            return json;
        }
        else {
            const decoded = base64url.decode(values[1]);
            const json = JSON.parse(decoded);
            return json;
        }
    }

    private static getAddress(node: any, network?: any): string {
        return city.payments.p2pkh({ pubkey: node.publicKey, network }).address;
    }
}
