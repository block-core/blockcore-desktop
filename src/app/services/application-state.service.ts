import { Injectable } from '@angular/core';
import { TitleService } from './title.service';
import { Observable } from 'rxjs';
import { ElectronService } from 'ngx-electron';

@Injectable({
    providedIn: 'root'
})
export class ApplicationStateService {

    // TODO: Figure out when multiple instance of singleton services is fixed for lazy-loaded routing/modules in Angular.
    // See details here: https://github.com/angular/angular/issues/12889#issuecomment-395720894
    static singletonInstance: ApplicationStateService;

    constructor(
        private electron: ElectronService,
        private readonly titleService: TitleService,
    ) {
        if (!ApplicationStateService.singletonInstance) {
            this.chain = this.getParam('chain') || 'city';
            this.mode = localStorage.getItem('Network:Mode') || 'full';
            this.network = localStorage.getItem('Network:Network') || 'citymain';

            ApplicationStateService.singletonInstance = this;
        }

        return ApplicationStateService.singletonInstance;
    }

    version: string;

    release: string;

    chain: string;

    mode: string;

    network: string;

    pageMode = false;

    handset = false;

    fullHeight = false;

    shutdownInProgress = false;

    shutdownDelayed = false;

    /** Indicates if we are connected from City Hub with the City Chain daemon. */
    connected = false;

    fullNodeVersion: string;

    protocolVersion: number;

    get appTitle$(): Observable<string> {
        return this.titleService.$title;
    }

    get isElectron(): boolean {
        return this.electron.isElectronApp;
    }

    getParam(n) {
        const half = location.search.split(n + '=')[1];
        return half !== undefined ? decodeURIComponent(half.split('&')[0]) : null;
    }

    setVersion(version: string) {
        this.version = version;

        if (this.version) {
            const v = version.split('.');
            if (v.length === 3) {
                this.release = v[2];
            } else {
                this.release = version;
            }
        }

    }
}
