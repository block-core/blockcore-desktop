import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { Identity } from '@models/identity';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class IdentityService {
    // Initialize the BehaviorSubject with data from the localStorage. The subject holds the internal state of the identities.
    private readonly identitiesSubject = new BehaviorSubject<Identity[]>(this.loadIdentities());
    private readonly identitySubject = new BehaviorSubject<Identity>(this.loadIdentity());

    constructor(public settings: SettingsService) {
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

    private initialize(): Identity[] {
        return [{
            name: 'Sondre Bjellås',
            shortname: 'Sondre Bjellås',
            alias: 'sondreb',
            title: 'Public',
            id: '32076c9f',
            published: true,
            locked: false,
            time: new Date()
        }, {
            name: 'SondreB',
            shortname: 'SondreB',
            alias: 'sondre',
            title: 'Personal, Gaming',
            id: '4a076c9f',
            published: true,
            locked: false,
            time: new Date()
        }, {
            name: 'Sondre Bjellås',
            shortname: 'Sondre Bjellås',
            alias: 'citychainfoundation',
            title: 'CTO, City Chain Foundation',
            id: '22076c9f',
            published: true,
            locked: false,
            time: new Date()
        }, {
            name: 'New Identity',
            shortname: 'New Identity',
            alias: null,
            title: 'Random',
            id: '76076c9f',
            published: false,
            locked: false,
            time: new Date()
        }, {
            name: 'Locked',
            shortname: 'Locked',
            alias: null,
            title: '?',
            id: '86076c9f',
            published: true,
            locked: true,
            time: new Date()
        }, {
            name: 'Locked',
            shortname: 'Locked',
            alias: null,
            title: '?',
            id: '96076c9f',
            published: false,
            locked: true,
            time: new Date()
        }];
    }
}
