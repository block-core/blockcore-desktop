import { Injectable } from '@angular/core';
import { TitleService } from './title.service';
import { Observable } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import { SettingsService } from './settings.service';

export interface DaemonConfiguration {
    mode: string;

    network: string;

    path: string;

    datafolder: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApplicationStateService {

    // TODO: Figure out when multiple instance of singleton services is fixed for lazy-loaded routing/modules in Angular.
    // See details here: https://github.com/angular/angular/issues/12889#issuecomment-395720894
    static singletonInstance: ApplicationStateService;

    constructor(
        private electron: ElectronService,
        private settings: SettingsService,
        private readonly titleService: TitleService,
    ) {
        if (!ApplicationStateService.singletonInstance) {

            this.chain = this.getParam('chain') || 'city';

            // TODO: These properties are deprecated, refactor!
            // this.mode = localStorage.getItem('Network:Mode') || 'full';
            // this.network = localStorage.getItem('Network:Network') || 'citymain';
            // this.path = localStorage.getItem('Network:Path') || '';

            let mode = localStorage.getItem('Network:Mode');

            if (!mode) {
                mode = localStorage.getItem('Network:ModePrevious');
            }

            this.daemon = {
                mode: mode || 'full',
                network: localStorage.getItem('Network:Network') || 'citymain',
                path: localStorage.getItem('Network:Path') || '',
                datafolder: localStorage.getItem('Network:DataFolder') || ''
            };

            if (electron.ipcRenderer) {
                // On startup, we'll send the initial hiding settings to main thread.
                electron.ipcRenderer.send('settings', { openAtLogin: settings.openOnLogin, showInTaskbar: settings.showInTaskbar });
            }

            ApplicationStateService.singletonInstance = this;
        }

        return ApplicationStateService.singletonInstance;
    }

    networkDefinition: any;

    networkParams: any;

    version: string;

    release: string;

    chain: string;

    daemon: DaemonConfiguration;

    // mode: string;

    // network: string;

    // path: string;

    pageMode = false;

    handset = false;

    fullHeight = false;

    shutdownInProgress = false;

    shutdownDelayed = false;

    /** Indicates if we are connected from City Hub with the City Chain daemon. */
    connected = false;

    changingMode = false;

    fullNodeVersion: string;

    protocolVersion: number;

    get appTitle$(): Observable<string> {
        return this.titleService.$title;
    }

    get isElectron(): boolean {
        return this.electron.isElectronApp;
    }

    get isSimpleMode(): boolean {
        return this.daemon.mode === 'simple';
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

    resetNetworkSelection() {
        localStorage.removeItem('Network:Mode');
        localStorage.removeItem('Network:Network');
        localStorage.removeItem('Network:Path');
        localStorage.removeItem('Network:DataFolder');
    }

    updateNetworkSelection(persist: boolean, mode: string, network: string, path: string, datafolder: string) {
        this.daemon.mode = mode;
        this.daemon.network = network;
        this.daemon.path = path;
        this.daemon.datafolder = datafolder;

        // TODO: Remove and depricate these properties.
        // this.mode = mode;
        // this.network = network;

        if (persist) {
            localStorage.setItem('Network:Mode', mode);
            localStorage.setItem('Network:Network', network);
            localStorage.setItem('Network:Path', path);
            localStorage.setItem('Network:DataFolder', datafolder);
        } else {
            this.resetNetworkSelection();
        }
    }
}
