import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, NgZone } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { ApplicationStateService } from '../../services/application-state.service';
import { HubConnectionBuilder } from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';
import { HDNode, Transaction } from 'bitcoinjs-lib';
import { ApiService } from '../../services/api.service';
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
import { delay, retryWhen } from 'rxjs/operators';
import { Logger } from '../../services/logger.service';
import { ElectronService } from 'ngx-electron';

export interface ListItem {
    name: string;
    id: string;
}

@Component({
    selector: 'app-advanced',
    templateUrl: './advanced.component.html',
    styleUrls: ['./advanced.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AdvancedComponent {
    @HostBinding('class.load') hostClass = true;

    selectedMode: ListItem;
    selectedNetwork: ListItem;
    loading: boolean;
    hasWallet = false;
    modes: ListItem[] = [];
    networks: ListItem[] = [];
    remember: boolean;
    connection: signalR.HubConnection;
    delayed = false;
    apiSubscription: any;

    constructor(
        private electronService: ElectronService,
        private authService: AuthenticationService,
        private router: Router,
        private zone: NgZone,
        private log: Logger,
        private apiService: ApiService,
        private appState: ApplicationStateService) {

    }

    resetDatabase() {
        this.log.info('Reset Blockchain Database...');
        const path = this.electronService.ipcRenderer.sendSync('reset-database', this.appState.network);
        this.log.info('Reset completed: ' + path);
    }

    openDataFolder() {
        const path = this.electronService.ipcRenderer.sendSync('open-data-folder', this.appState.network);
    }

    initialize() {
    }

    cancel() {
        this.router.navigateByUrl('/');
    }
}
