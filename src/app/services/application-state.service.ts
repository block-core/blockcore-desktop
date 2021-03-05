/* eslint-disable */

import { Injectable } from '@angular/core';
import { TitleService } from './title.service';
import { Observable } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import { SettingsService } from './settings.service';
import { Chain, ChainService } from './chain.service';
import { WalletAccount } from '../components/login/login.component';
import { StorageService } from './storage.service';

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
        public chains: ChainService,
        private storage: StorageService,
        private readonly titleService: TitleService,
    ) {
        if (!ApplicationStateService.singletonInstance) {

            this.chain = this.getParam('chain') || 'city';

            let mode = localStorage.getItem('Network:Mode');

            if (!mode) {
                mode = localStorage.getItem('Network:ModePrevious');
            }

            this.daemon = {
                mode: mode || 'full',
                network: localStorage.getItem('Network:Network'),
                path: localStorage.getItem('Network:Path') || '',
                datafolder: localStorage.getItem('Network:DataFolder') || ''
            };

            // Make sure that the chain setup is available in the appstate on startup.
            this.activeChain = this.chains.availableChains.find(network => network.network === this.daemon.network);

            if (electron.ipcRenderer) {
                // On startup, we'll send the initial hiding settings to main thread.
                electron.ipcRenderer.send('settings', { openAtLogin: settings.openOnLogin, showInTaskbar: settings.showInTaskbar });
            }

            ApplicationStateService.singletonInstance = this;
        }

        return ApplicationStateService.singletonInstance;
    }

    accounts: WalletAccount[] = [];

    networkDefinition: any;

    networkParams: any;

    version: string;

    release: string;

    chain: string;

    activeChain: Chain;

    changeToChain: Chain;

    isChangingToChain: boolean;

    daemon: DaemonConfiguration;

    pageMode = false;

    handset = false;

    fullHeight = false;

    shutdownInProgress = false;

    shutdownDelayed = false;

    /** Indicates if we are connected from Hub to the node. */
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

    get addressType(): string {
        return this.storage.getValue('AddressType', 'Legacy', true);
    }

    set addressType(value: string) {
        this.storage.setValue('AddressType', value, true);
    }

    addressTypes = ['Legacy', 'Segwit'];

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
