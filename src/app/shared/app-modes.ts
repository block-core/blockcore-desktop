/* eslint-disable */

import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AppModes {

    constructor() {
        const activeId = localStorage.getItem('Settings:Mode') || 'basic';
        this.active = this.available.find(m => m.id === activeId);
    }

    available: AppMode[] = [{
        id: 'basic',
        name: 'Basic',
        features: ['dashboard', 'wallet', 'merchants', 'settings', 'logout']
    }, {
        id: 'advanced',
        name: 'Advanced',
        features: ['dashboard', 'wallet', 'history', 'merchants', 'settings', 'logout', 'staking', 'walletmode', 'send-options']
    }, {
        id: 'experimental',
        name: 'Experimental',
        features: ['dashboard', 'wallet', 'history', 'merchants', 'settings', 'logout', 'staking', 'walletmode', 'send-options', 'signing', 'identity', 'hubs', 'debug']
    }];

    active: AppMode;

    enabled(module: string): boolean {
        return (this.active.features.indexOf(module) > -1);
    }

    activate(modeId: string) {
        this.active = this.available.find(m => m.id === modeId);
    }
}

export interface AppMode {
    id: string;
    name: string;
    features: string[];
}
