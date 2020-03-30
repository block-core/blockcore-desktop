import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { Identity } from '@models/identity';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ElectronService } from 'ngx-electron';
import { ApplicationStateService } from './application-state.service';

import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import * as bip38 from 'city-bip38';
import * as city from 'city-lib';
import { HDNode } from 'city-lib';
import * as wif from 'wif';
import * as coininfo from 'city-coininfo';

@Injectable({
    providedIn: 'root'
})
export class IdentityService {
    // Initialize the BehaviorSubject with data from the localStorage. The subject holds the internal state of the identities.
    private readonly identitiesSubject = new BehaviorSubject<Identity[]>(this.loadIdentities());
    private readonly identitySubject = new BehaviorSubject<Identity>(this.loadIdentity());

    private identityRoot: HDNode;
    private identityExtPubKey: HDNode;
    private identityNetwork = {
        pubKeyHash: 55,
        scriptHash: 117
    };

    constructor(
        private appState: ApplicationStateService,
        public settings: SettingsService,
        private electronService: ElectronService,
    ) {
        console.log('IdentityService CONSTRUCTOR! CALLED ONLY ONCE?!');
    }

    readonly identity$ = this.identitySubject.asObservable();

    readonly identities$ = this.identitiesSubject.asObservable();

    readonly lockedIdentities$ = this.identities$.pipe(map(items => items.filter(item => item.locked)));

    readonly publishedIdentities$ = this.identities$.pipe(map(items => items.filter(item => item.published)));

    get identities(): Identity[] {
        return this.identitiesSubject.getValue();
    }

    set identities(val: Identity[]) {
        this.identitiesSubject.next(val);
    }

    // getAddress(node: any, network?: any): string {
    //     return bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address!;
    // }

    toBuffer(ab) {
        const buf = Buffer.alloc(ab.byteLength);
        const view = new Uint8Array(ab);
        for (let i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }

    unlock(path: string, password: string) {

        // Read the seed from the file on disk.
        const seed: { encryptedSeed: string, chainCode: string } = this.electronService.ipcRenderer.sendSync('get-wallet-seed', path);

        // Descrypt the seed with the password provided on unlock (login).
        bip38.decryptAsync(seed.encryptedSeed, password, (decryptedKey) => {
            // tslint:disable-next-line: no-debugger
            // debugger;

            const chainCode = Buffer.from(seed.chainCode, 'base64');

            // Dispose of this object, we don't want to keep the root extkey after initial login.
            const masterNode = bip32.fromPrivateKey(decryptedKey.privateKey, chainCode, this.appState.networkDefinition);

            // tslint:disable-next-line: quotemark
            const identityRoot: HDNode = masterNode.derivePath("m/302'");

            // Persist the identity node that we need to generate identities and keys for them.
            this.identityRoot = identityRoot;

            this.identityExtPubKey = identityRoot.neutered();

        }, null, this.appState.networkParams);
    }

    getIdentity(index: number) {
        // tslint:disable-next-line: quotemark
        return this.identityRoot.deriveHardened(index); // .derivePath("/" + index + "'");
    }

    getKey(index: number) {
        // tslint:disable-next-line: quotemark
        return this.identityRoot.deriveHardened(index);
        // return this.identityRoot.derivePath("/" + index + "'");
    }

    add(identity: Identity) {
        // Ensure we create a new array and don't modify existing.
        this.identities = [
            ...this.identities,
            identity
        ];

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
    }

    remove(id: string) {
        const identity = this.identities.find(t => t.id === id);
        this.identities = this.identities.filter(i => i.id !== id);

        // Save to service, then update again.
        try {

        } catch (e) {
            console.error(e);
            // Add the identity back to the collection again, we did not successfully delete it.
            this.identities = [...this.identities, identity];
        }

    }

    get(id: string) {
        const identity = this.identities.find(t => t.id === id);
        return identity;
    }

    /** Get identities from localStorage. Only called during object creation. */
    private loadIdentities(): Identity[] {
        // If there are no identities, populate with mock data.
        if (this.settings.identities == null) {
            this.settings.identities = this.initialize();
        }
        // Return JSON serialized identities from localStorage.
        return this.settings.identities;
    }

    /** Get identity from localStorage. Only called during object creation. */
    private loadIdentity(id?: string): Identity {
        const identityId = id || this.settings.identity;
        return this.identitiesSubject.getValue().find(i => i.id === identityId);
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
        const identity = this.getIdentity(index);
        const address = this.getAddress(identity, this.identityNetwork);
        return address;
    }

    private initialize(): Identity[] {
        return [{
            name: 'Sondre Bjellås',
            shortname: 'Sondre Bjellås',
            alias: 'sondreb',
            title: 'Public',
            index: 0,
            id: 'PJZZYTPq2Uf6LJRkdgTVZ4xgRBi3vZmpdf',
            published: true,
            locked: false,
            time: new Date()
        }, {
            name: 'SondreB',
            shortname: 'SondreB',
            alias: 'sondre',
            title: 'Personal, Gaming',
            index: 1,
            id: 'PHnT3Fx1EN5uMBbYBivjDdkke3n2pb5svd',
            published: true,
            locked: false,
            time: new Date()
        }, {
            name: 'Sondre Bjellås',
            shortname: 'Sondre Bjellås',
            alias: 'citychainfoundation',
            title: 'CTO, City Chain Foundation',
            index: 2,
            id: 'PXdMWVDaG1kmqbQX5JdsE5m4HFnRVxoqHf',
            published: true,
            locked: false,
            time: new Date()
        }, {
            name: 'New Identity',
            shortname: 'New Identity',
            alias: null,
            title: 'Random',
            index: 3,
            id: 'PXdMWVDaG1kmqbQX5JdsE5m4HFnRVxoqHf',
            published: false,
            locked: false,
            time: new Date()
        }, {
            name: 'Locked',
            shortname: 'Locked',
            alias: null,
            title: '?',
            index: 4,
            id: 'PMzHABeaLVHP7kLDYFeHkE1CZaeS8wXvxv',
            published: true,
            locked: true,
            time: new Date()
        }, {
            name: 'Locked',
            shortname: 'Locked',
            alias: null,
            title: '?',
            index: 5,
            id: 'PFfMFoJWHmHuQWfxoAmjgq7cqVxC9xTXfr',
            published: false,
            locked: true,
            time: new Date()
        }];
    }
}
