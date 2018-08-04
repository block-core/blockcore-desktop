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

export interface ListItem {
    name: string;
    id: string;
}

@Component({
    selector: 'app-load',
    templateUrl: './load.component.html',
    styleUrls: ['./load.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LoadComponent {
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
        private authService: AuthenticationService,
        private router: Router,
        private zone: NgZone,
        private apiService: ApiService,
        private appState: ApplicationStateService) {

        this.modes = [
            //{ id: 'simple', name: 'Mobile' }, // Disabled in beta release.
            //{ id: 'light', name: 'Light' }, // Disabled in beta release.
            { id: 'full', name: 'Full' },
            //{ id: 'pos', name: 'Point-of-Sale (POS)' },
            //{ id: 'readonly', name: 'Read-only' }
        ];

        this.networks = [
            //{ id: 'main', name: 'Main' }, // Disabled in beta release.
            { id: 'testnet', name: 'Test' },
            //{ id: 'regtest', name: 'RegTest' } // Disabled in beta release.
        ];

        this.selectedMode = this.modes[0];
        this.selectedNetwork = this.networks[0];
        this.remember = true;

        const existingMode = localStorage.getItem('Mode');

        // If user has choosen to remember mode, we'll redirect directly to login, when connected.
        if (existingMode != null) {
            this.initialize();
        }
    }

    initialize() {
        this.apiService.initialize();

        if (this.appState.mode === 'full') {
            this.loading = true;
            this.fullNodeConnect();
        }
    }

    launch() {
        if (this.remember) {
            localStorage.setItem('Mode', this.selectedMode.id);
            localStorage.setItem('Network', this.selectedNetwork.id);
        }
        else {
            localStorage.removeItem('Mode');
            localStorage.removeItem('Network');
        }

        this.appState.mode = this.selectedMode.id;
        this.appState.network = this.selectedNetwork.id;

        this.initialize();
    }

    fullNodeConnect() {
        // Do we need to keep a pointer to this timeout and remove it, or does the zone handle that?
        this.zone.run(() => {
            setTimeout(() => {
                this.delayed = true;
            }, 8000);
        });

        this.apiSubscription = this.apiService.getWalletFiles()
            .pipe(retryWhen(errors => errors.pipe(delay(2000))))
            .subscribe(() => this.start());
    }

    start() {
        this.loading = false;
        this.router.navigateByUrl('/login');
    }

    cancel() {
        this.apiSubscription.unsubscribe();
        this.loading = false;
        this.delayed = false;
        this.appState.mode = null;
    }

    simpleWalletConnect() {
        // Meet the new stack for real-time web communication: ASP.NET Core SignalR
        // Learn more: https://www.youtube.com/watch?v=Lws0zOaseIM

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:8081/wallet')
            .build();

        this.connection.on('ReceiveMessage', (user, message) => {
            console.log(user);
            console.log(message);
        });

        this.connection.on('txs', (transactions) => {

            console.log(transactions);

            // TODO: Update a bitcore-lib fork to add support for Stratis/City Chain.
            // var tx1 = transactions[0];
            // var tx = bitcoin.Transaction.fromHex(tx1.value.hex);
        });

        const self = this;

        // Transport fallback functionality is now built into start.
        this.connection.start()
            .then(function () {
                console.log('connection started');
                self.connection.invoke('CreateWallet', 'cityhub-mobile-0.0.1', '2018-01-01', ['SMsZGWkF9zR5mjxWTYsDq9pU5ZHdUQw1jJ']).catch(err => console.error(err.toString()));
            })
            .catch(error => {
                console.error(error.message);
            });
    }

    simpleWalletWatch() {
        this.connection.invoke('Watch', 'SMsZGWkF9zR5mjxWTYsDq9pU5ZHdUQw1jJ').catch(err => console.error(err.toString()));
    }

    simpleWalletBalance() {
        this.connection.invoke('Balance', 'SMsZGWkF9zR5mjxWTYsDq9pU5ZHdUQw1jJ').catch(err => console.error(err.toString()));
    }
}
