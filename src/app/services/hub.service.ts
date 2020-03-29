import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { Hub } from '@models/hub';

@Injectable({
    providedIn: 'root'
})
export class HubService {
    static singletonInstance: HubService;

    private hubs: Hub[];

    constructor(public settings: SettingsService) {
        if (!HubService.singletonInstance) {
            HubService.singletonInstance = this;
        }

        // If we don't have any hubs, make sure we initialize it.
        if (settings.hubs == null) {
            settings.hubs = this.initialize();
        } else {
            this.hubs = settings.hubs;
        }

        return HubService.singletonInstance;
    }

    private api<T>(url: string): Promise<T> {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json() as Promise<T>;
            });
    }

    private initialize(): Hub[] {
        this.hubs = [{ id: '1b9715afa903c82b383abb74b6cd746bdd3beea3', name: 'Liberstad', url: 'https://hub.liberstad.com' }, { id: '2b9715afa903c82b383abb74b6cd746bdd3beea3', name: 'City Chain', url: 'https://hub.city-chain.org' }
        ];

        return this.hubs;
    }

    private persist() {
        this.settings.hubs = this.hubs;
    }

    /**
     * Remvoe a hub hub
     */
    remove(id: string) {
        const index = this.hubs.findIndex(h => h.id === id);

        console.log('Found index:' + index);

        if (index > -1) {
            console.log('splicing...');
            this.hubs.splice(index, 1);
            this.persist();
        }
    }

    /**
     * Add a hub
     */
    async add(url: string) {

        let hubUrl = url;

        // Build the entire URL for retreiving the identity of specified hub.
        if (hubUrl.indexOf('.well-known') === -1) {
            if (hubUrl.substring(hubUrl.length - 1) !== '/') {
                hubUrl += '/';
            }

            hubUrl += '.well-known/blockcore/hub/identity';
        }

        const hub = await this.api<Hub>(hubUrl);

        hub.url = url;
        hub.wellKnownUrl = hubUrl;

        this.hubs.push(hub);

        this.persist();

        // Consumer
        // this.api<{ title: string; message: string }>('v1/posts/1')
        //     .then(({ title, message }) => {
        //         console.log(title, message)
        //     })
        //     .catch(error => {
        //         /* show error message */
        //     })

        // fetch('http://swapi.co/api/people/1/')
        //     .then(res => res.json<Actor>())
        //     .then(res => {
        //         let b: Actor = res;
        //     });

        // const params = new HttpParams({
        //     fromObject: {
        //         command: 'add',
        //         endpoint: ip,
        //     }
        // });

        // console.log(params);

        // return this.http
        //     .get(this.apiUrl + '/ConnectionManager/addnode', { headers: this.headers, params })
        //     .pipe(catchError(this.handleError.bind(this)))
        //     .pipe(map((response: Response) => response));
    }
}
