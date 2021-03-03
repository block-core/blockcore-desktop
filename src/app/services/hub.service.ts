/* eslint-disable */

import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { Hub, HubContainer } from '@models/hub';

@Injectable({
    providedIn: 'root'
})
export class HubService {
    static singletonInstance: HubService;

    public hubs: HubContainer[];

    constructor(public settings: SettingsService) {
        if (!HubService.singletonInstance) {
            HubService.singletonInstance = this;
        }

        // If we don't have any hubs, make sure we initialize it.
        if (settings.hubs == null || settings.hubs.length === 0) {
            this.hubs = this.initialize();
        } else {
            this.hubs = settings.hubs;
        }

        // Handle empty hubs array that can happen on new or clean clients.
        if (this.hubs == null) {
            this.hubs = [];
        }

        return HubService.singletonInstance;
    }

    private api<T>(url: string, method: string = 'GET', data?: any): Promise<T> {
        return fetch(url, {
            method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json() as Promise<T>;
            });
    }

    private persist() {
        this.settings.hubs = this.hubs;
    }

    async put(signedDocument: any, type: string) {
        const hub = this.getHub();

        console.log('CONTAINER:', signedDocument);

        // TODO: Use the URL from the Hub. For now relay on the City Chain Identity host.
        // const url = hub.content.url + '/api/' + type;
        const url = 'http://localhost:4335/api/' + type;

        // const url = 'http://localhost:4335/api/' + signedDocument.id; // .id is a shortcut of '@type/' + id.
        // const url = 'https://identity.city-chain.org/' + signedDocument.container + '/' + signedDocument.id;

        console.log('url', url);

        const results = await this.api<any>(url, 'PUT', signedDocument);
        console.log('RESULTS:', results);
    }

    async download(url: string) {
        const MSGPACK_TYPE = 'application/x-msgpack';

        const response = await fetch(url);
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.startsWith(MSGPACK_TYPE) && response.body != null) {

            // TODO: FIX!
            // const object = await decodeAsync(response.body);
            const object = null;
            // do something with object
        } else { /* handle errors */ }
    }

    getHub() {
        const hub = this.hubs.find(h => h.content.identifier === this.settings.hub);

        return hub;
    }

    /**
     * Remvoe a hub hub
     */
    remove(id: string) {
        const index = this.hubs.findIndex(h => h.content.identifier === id);

        console.log('Found index:' + index);

        if (index > -1) {
            console.log('splicing...');
            this.hubs.splice(index, 1);
            this.persist();
        }
    }

    // async refresh(hub: HubContainer) {
    //     const originalUrl = hub.originalUrl;
    //     const wellKnownUrl = hub.wellKnownUrl;

    //     console.log('HUB1:', hub);

    //     try {
    //         hub = await this.api<HubContainer>(hub.wellKnownUrl);
    //         hub.originalUrl = originalUrl;
    //         hub.wellKnownUrl = wellKnownUrl;
    //         hub.status = 'Online';

    //         console.log('HUB2:', hub);
    //     }
    //     catch (err) {
    //         hub.status = 'Error: ' + err;
    //     }
    // }

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

            hubUrl += '.well-known/blockcore/node/identity';
        }


        let hub = null;

        try {
            hub = await this.api<HubContainer>(hubUrl);

            hub.originalUrl = url;
            hub.wellKnownUrl = hubUrl;
            hub.status = 'Online';

            // If this hub already exists, simply replace it.
            const existingIndex = this.hubs.findIndex(h => h.content.identifier === hub.content.identifier);

            if (existingIndex > -1) {
                console.log('ALREADY EXISTS, REMOVE IT!');
                this.hubs.splice(existingIndex, 1);
            }
        }
        catch (err) {
            hub.status = 'Error: ' + err;
        }

        if (hub) {
            this.hubs.push(hub);

            // If there is only a single hub entry, make sure it's the default one.
            if (this.hubs.length === 1) {
                this.settings.hub = hub.content.identifier;
            }
        }

        this.persist();
    }

    private initialize(): HubContainer[] {
        this.hubs = [];
        return this.hubs;
    }
}
