/* eslint-disable */

import { Injectable, OnDestroy } from '@angular/core';
import { SettingsService } from './settings.service';
import { Identity, IdentityContainer } from '@models/identity';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApplicationStateService } from './application-state.service';
import * as bip32 from 'bip32';
import * as bip38 from '../../libs/bip38';
import * as city from 'city-lib';
import { HDNode } from 'city-lib';
import { HubService } from './hub.service';
import { StorageService } from './storage.service';
import { AuthenticationService } from './authentication.service';
import { ElectronService } from 'ngx-electron';
import { Jws } from '../shared/jose';

@Injectable({
    providedIn: 'root'
})
export class IdentityService implements OnDestroy {
    // Initialize the BehaviorSubject with data from the localStorage. The subject holds the internal state of the identities.
    private readonly identitiesSubject = new BehaviorSubject<IdentityContainer[]>([]);
    private readonly identitySubject = new BehaviorSubject<IdentityContainer>(null);

    get identityIndex(): number {
        return this.storage.getNumber('Identity:Index', -1, true);
    }

    set identityIndex(value: number) {
        this.storage.setValue('Identity:Index', value.toString(), true);
    }

    private identityRoot: HDNode;
    private identityExtPubKey: HDNode;
    private seed: any;

    private identityNetwork = {
        pubKeyHash: 55,
        scriptHash: 117
    };

    constructor(
        private appState: ApplicationStateService,
        public hubService: HubService,
        private authentication: AuthenticationService,
        private electronService: ElectronService,
        public storage: StorageService,
    ) {
        console.log('IdentityService created.');

    }

    readonly identity$ = this.identitySubject.asObservable();

    readonly identities$ = this.identitiesSubject.asObservable();

    readonly lockedIdentities$ = this.identities$.pipe(map(items => items.filter(item => item.locked)));

    readonly publishedIdentities$ = this.identities$.pipe(map(items => items.filter(item => item.published)));

    get identities(): IdentityContainer[] {
        return this.identitiesSubject.getValue();
    }


    set identities(val: IdentityContainer[]) {
        this.identitiesSubject.next(val);
    }

    get identity(): IdentityContainer {
        return this.identitySubject.getValue();
    }

    set identity(val: IdentityContainer) {
        this.identitySubject.next(val);

        // Persist the set identity as active identity.
        this.storage.setValue('Identity', val.content.identifier, true);
    }

    public refresh(): void {
        this.identitiesSubject.next(this.identities);
    }

    load() {
        this.identities = this.loadIdentities();
        this.identitySubject.next(this.loadIdentity());

        // Make sure we set the current identity index, and simply use the current length if value is missing from before.
        // this.identityIndex = this.storage.getNumber('Identity:Index', this.identities.length, true);
    }

    ngOnDestroy() { console.log('IdentityService instance destroyed.'); }

    toBuffer(ab) {
        const buf = Buffer.alloc(ab.byteLength);
        const view = new Uint8Array(ab);
        for (let i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }

    verifyPassword(password: string) {
        const decryptedKey = bip38.decrypt(this.seed.encryptedSeed, password, null, null, this.appState.networkParams);
        console.log(decryptedKey);
    }

    unlock(path: string, password: string) {
        // Read the seed from the file on disk.
        const seed: { encryptedSeed: string; chainCode: string } = this.electronService.ipcRenderer.sendSync('get-wallet-seed', path);

        // Keep a copy of the encrypted seed. For mobile mode, this will be available in the local storage / indexeddb.
        this.seed = seed;

        // Descrypt the seed with the password provided on unlock (login).
        // bip38.decryptAsync(seed.encryptedSeed, password, (decryptedKey) => {
        // }, null, this.appState.networkParams);

        const decryptedKey = bip38.decrypt(seed.encryptedSeed, password, null, null, this.appState.networkParams);

        const chainCode = Buffer.from(seed.chainCode, 'base64');

        // Dispose of this object, we don't want to keep the root extkey after initial login.
        const masterNode = bip32.fromPrivateKey(decryptedKey.privateKey, chainCode, this.appState.networkDefinition);

        // eslint-disable-next-line @typescript-eslint/quotes
        const identityRoot: HDNode = masterNode.derivePath("m/302'");

        // Persist the identity node that we need to generate identities and keys for them.
        this.identityRoot = identityRoot;

        this.identityExtPubKey = identityRoot.neutered();

        // Load identities after unlocking.
        this.load();

    }

    getIdentityNode(index: number) {
        return this.identityRoot.deriveHardened(index);
    }

    getKey(index: number) {
        return this.identityRoot.deriveHardened(index);
    }

    sign(document: any, index: number): string {
        const identity = this.getIdentityNode(index);
        const jwt = Jws.encode(document, identity);

        return jwt;
    }

    create() {
        // Get the next identity in line, based on what we have queries so far;
        const identityNode = this.getIdentityNode(this.identityIndex + 1);
        const identityId = this.getAddress(identityNode, this.identityNetwork);

        const identity = new Identity();
        identity.identifier = 'did:is:' + identityId;
        identity.iat = Date.now();

        const container = new IdentityContainer(identity);

        container.header = null;
        container.payload = null;
        container.signature = null;
        container.published = false;
        container.publish = true;
        container.index = this.identityIndex + 1; // We should not persist this new index until after we actually save it.

        return container;
    }

    /** Add the identity locally and publish if both publish parameter is specified, and .publish on the identity. */
    add(identity: IdentityContainer, publish: boolean = true) {
        const index = this.identities.findIndex(t => t.content.identifier === identity.content.identifier);

        // Upgrade the version to what we currently support.
        identity.version = 3;

        if (index === -1) {
            // Ensure we create a new array and don't modify existing.
            this.identities = [
                ...this.identities,
                identity
            ];

            // Increase the spent identity index.
            // this.identityIndex++;

        } else {
            this.identities[index] = identity;
        }

        // Now that we have added this new identity to the identities locally, make sure we register that the index is spent.
        this.identityIndex = identity.index;

        // If publish is turned on, ensure we send our updated identity to one of the platform hubs.
        if (publish && identity.publish) {
            // Get the signature for the entity.
            const jwt = this.sign(identity.content, identity.index);

            const jwtValues = jwt.split('.');

            identity.header = jwtValues[0];
            identity.payload = jwtValues[1];
            identity.signature = jwtValues[2];

            const message = {
                version: 4,
                content: jwt
            };

            this.hubService.put(message, 'identity');
        }

        // try {
        //     const todo = await this.todosService
        //         .create({ title, isCompleted: false })
        //         .toPromise();

        //     // we swap the local tmp record with the record from the server (id must be updated)
        //     const index = this.todos.indexOf(this.todos.find(t => t.id === tmpId));
        //     this.todos[index] = {
        //         ...todo
        //     }
        //     this.todos = [...this.todos];
        // } catch (e) {
        //     // is server sends back an error, we revert the changes
        //     console.error(e);
        //     this.removeTodo(tmpId, false);
        // }

        this.saveIdentities();
    }

    remove(id: string) {
        const identity = this.identities.find(t => t.content.identifier === id);
        this.identities = this.identities.filter(i => i.content.identifier !== id);

        if (identity.published) {
            // Save to service, then update again.
            try {
                // Reset the identity to an empty entity.
                identity.content = new Identity();
                identity.content.identifier = id;
                identity.content.iat = Date.now();
                identity.content['@state'] = 999;

                // Get the signature for the entity.
                const jwt = this.sign(identity.content, identity.index);

                const jwtValues = jwt.split('.');

                identity.header = jwtValues[0];
                identity.payload = jwtValues[1];
                identity.signature = jwtValues[2];

                const message = {
                    version: 4,
                    content: jwt
                };

                this.hubService.put(message, 'identity');
            } catch (e) {
                console.error(e);
                // Add the identity back to the collection again, we did not successfully delete it.
                this.identities = [...this.identities, identity];
            }
        }

        this.saveIdentities();
    }

    get(id: string) {
        const identity = this.identities.find(t => t.content.identifier === id);
        return identity;
    }

    getImage(image) {
        if (!image) {
            image = 'data:image/png;base64,iVBORw0KGg'
                + 'oAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAU'
                + 'AAarVyFEAAAAASUVORK5CYII=';
        }

        return image;
    }

    async find(id: string): Promise<IdentityContainer> {
        // const identityApiUrl = 'https://identity.city-chain.org/api/identity/' + id;
        const baseUrl = this.hubService.getHub().content.url;
        console.log('baseUrl', baseUrl);
        const identityApiUrl = baseUrl + '/api/identity/' + id;
        console.log('identityApiUrl', identityApiUrl);
        // const identityApiUrl = 'https://identity.city-chain.org/api/identity/' + id;
        // const identityApiUrl = 'http://localhost:4335/api/identity/' + id;

        return await this.api<IdentityContainer>(identityApiUrl);
    }

    /** Get identities from localStorage. Only called during object creation. */
    private loadIdentities(): IdentityContainer[] {
        // If there are no identities, populate with mock data.
        let identities = this.storage.getJSON('Identities', '[]', true);

        if (identities.length === 0) {
            identities = this.initialize();
        }

        // Return JSON serialized identities from localStorage.
        return identities;
    }

    /** Get identity from localStorage. Only called during object creation. */
    private loadIdentity(id?: string): IdentityContainer {
        const identityId = id || this.storage.getValue('Identity', null, true);

        console.log('LOADING IDENTITY', identityId);

        return this.identitiesSubject.getValue().find(i => i.content.identifier === identityId);
    }

    private saveIdentities() {
        // Save the latest value from the subject into local storage.
        this.storage.setJSON('Identities', this.identities, true);
    }

    // setIdentity(id: string) {
    //     this.settings.identity = id;
    //     const identity = this.getIdentity(id);
    //     this.identitySubject.next(identity);
    // }

    // setIdentities(identities: Identity[]) {
    //     // Persist the identities.
    //     this.settings.identities = identities;

    //     // Call all subscribers with updated identities.
    //     this.identitiesSubject.next(identities);
    // }

    private api<T>(url: string): Promise<T> {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json() as Promise<T>;
            });
    }

    getAddress(node: any, network?: any): string {
        return city.payments.p2pkh({ pubkey: node.publicKey, network }).address;
    }

    getId(index: number) {
        const identity = this.getIdentityNode(index);
        const address = this.getAddress(identity, this.identityNetwork);
        return address;
    }

    /** Performs a query to find identity based on index number */
    async findByIndex(index: number): Promise<IdentityContainer> {
        let identity: IdentityContainer = null;
        const identityNode = this.getIdentityNode(index);
        const identityId = this.getAddress(identityNode, this.identityNetwork);

        try {
            identity = await this.find(identityId);

            if (identity) {
                // Update local state fo the container.
                identity.published = true;
                identity.publish = true;
                identity.index = index;

                this.add(identity, false);
            }

            // If the last found index is higher than previously known index height, make sure we save it.
            if (index > this.identityIndex) {
                this.identityIndex = index;
            }
        }
        catch (err) {
            // console.log('Identity find result: ', err);
        }

        return identity;
    }

    /** Performs a scan of identities from index and number of coint. Returns true if anything is found. */
    // async scan2(index: number, count: number) {
    //     // Reset the scan index height.
    //     // this.identityIndex = -1;

    //     let found = false;
    //     let lastFoundIndex = 0;

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    //     for (let i = index; i < count; i++) {

    //         const identityNode = this.getIdentityNode(i);
    //         const identityId = this.getAddress(identityNode, this.identityNetwork);

    //         try {
    //             const identity = await this.find(identityId);

    //             if (identity) {
    //                 this.add(identity);
    //             }

    //             console.log('FOUND!!!');

    //             found = true;

    //             lastFoundIndex = index;
    //         }
    //         catch (err) {
    //             // console.log('Identity find result: ', err);
    //         }
    //     }

    //     // If the last found index is higher than previously known index height, make sure we save it.
    //     if (lastFoundIndex > this.identityIndex) {
    //         this.identityIndex = lastFoundIndex;
    //     }

    //     return found;
    // }

    private initialize(): IdentityContainer[] {
        return [];
        // return [{
        //     name: 'Sondre Bjellås',
        //     shortName: 'Sondre Bjellås',
        //     alias: 'sondreb',
        //     title: 'Public',
        //     id: 'PJZZYTPq2Uf6LJRkdgTVZ4xgRBi3vZmpdf',
        //     published: true,
        //     locked: false,
        //     time: new Date()
        // }, {
        //     name: 'SondreB',
        //     shortname: 'SondreB',
        //     alias: 'sondre',
        //     title: 'Personal, Gaming',
        //     id: 'PHnT3Fx1EN5uMBbYBivjDdkke3n2pb5svd',
        //     published: true,
        //     locked: false,
        //     time: new Date()
        // }, {
        //     name: 'Sondre Bjellås',
        //     shortname: 'Sondre Bjellås',
        //     alias: 'citychainfoundation',
        //     title: 'CTO, City Chain Foundation',
        //     id: 'PXdMWVDaG1kmqbQX5JdsE5m4HFnRVxoqHf',
        //     published: true,
        //     locked: false,
        //     time: new Date()
        // }, {
        //     name: 'New Identity',
        //     shortname: 'New Identity',
        //     alias: null,
        //     title: 'Random',
        //     id: 'PH99VjuZKX36CoKkXE4Z87BPKt2c4FyTwZ',
        //     published: false,
        //     locked: false,
        //     time: new Date()
        // }, {
        //     name: 'Locked',
        //     shortname: 'Locked',
        //     alias: null,
        //     title: '?',
        //     id: 'PMzHABeaLVHP7kLDYFeHkE1CZaeS8wXvxv',
        //     published: true,
        //     locked: true,
        //     time: new Date()
        // }, {
        //     name: 'Locked',
        //     shortname: 'Locked',
        //     alias: null,
        //     title: '?',
        //     id: 'PFfMFoJWHmHuQWfxoAmjgq7cqVxC9xTXfr',
        //     published: false,
        //     locked: true,
        //     time: new Date()
        // }];
    }
}
