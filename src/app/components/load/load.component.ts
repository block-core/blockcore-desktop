import { Component, ViewEncapsulation, HostBinding, NgZone, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { ApplicationStateService } from '../../services/application-state.service';
import * as signalR from '@aspnet/signalr';
import { ApiService } from '../../services/api.service';
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
import { delay, retryWhen } from 'rxjs/operators';
import { Logger } from '../../services/logger.service';

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
export class LoadComponent implements OnDestroy {
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
        private log: Logger,
        private zone: NgZone,
        private apiService: ApiService,
        private appState: ApplicationStateService) {

        this.modes = [
            // { id: 'simple', name: 'Mobile' }, // Disabled in beta release.
            // { id: 'light', name: 'Light' }, // Disabled in beta release.
            { id: 'full', name: 'Full' },
            // { id: 'pos', name: 'Point-of-Sale (POS)' },
            // { id: 'readonly', name: 'Read-only' }
        ];

        this.networks = [
            // { id: 'main', name: 'Main' }, // Disabled in beta release.
            { id: 'citytest', name: 'City Chain (Test)' },
            { id: 'citymain', name: 'City Chain' },
            { id: 'stratistest', name: 'Stratis (Test)' },
            { id: 'stratismain', name: 'Stratis' },
            // { id: 'regtest', name: 'RegTest' } // Disabled in beta release.
        ];

        this.selectedMode = this.modes[0];
        this.selectedNetwork = this.networks[0];
        this.remember = true;

        const existingMode = localStorage.getItem('Network:Mode');

        // this.log.info(`Mode: ${this.selectedMode}, Network: ${this.selectedNetwork}.`);
        this.log.info('Mode:', this.selectedMode);
        this.log.info('Network:', this.selectedNetwork);

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
            localStorage.setItem('Network:Mode', this.selectedMode.id);
            localStorage.setItem('Network:Network', this.selectedNetwork.id);
        } else {
            localStorage.removeItem('Network:Mode');
            localStorage.removeItem('Network:Network');
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
            }, 30000); // Make sure it is fairly high, we don't want users to immediatly perform advanced reset options when they don't need to.
        });

        this.apiSubscription = this.apiService.getWalletFiles()
            .pipe(retryWhen(errors => errors.pipe(delay(2000))))
            .subscribe(() => this.start());
    }

    start() {
        this.loading = false;
        this.router.navigateByUrl('/login');
    }

    ngOnDestroy() {
        this.unsubscribe();
    }

    unsubscribe() {
        if (this.apiSubscription) {
            this.apiSubscription.unsubscribe();
        }
    }

    cancel() {
        this.unsubscribe();

        this.loading = false;
        this.delayed = false;
        this.appState.mode = null;
    }

    // simpleWalletConnect() {
    //     // Meet the new stack for real-time web communication: ASP.NET Core SignalR
    //     // Learn more: https://www.youtube.com/watch?v=Lws0zOaseIM

    //     this.connection = new signalR.HubConnectionBuilder()
    //         .withUrl('http://localhost:8081/wallet')
    //         .build();

    //     this.connection.on('ReceiveMessage', (user, message) => {
    //         console.log(user);
    //         console.log(message);
    //     });

    //     this.connection.on('txs', (transactions) => {

    //         console.log(transactions);

    //         // TODO: Update a bitcore-lib fork to add support for Stratis/City Chain.
    //         // var tx1 = transactions[0];
    //         // var tx = bitcoin.Transaction.fromHex(tx1.value.hex);
    //     });

    //     const self = this;

    //     // Transport fallback functionality is now built into start.
    //     this.connection.start()
    //         .then(function () {
    //             console.log('connection started');
    //             self.connection.invoke('CreateWallet', 'cityhub-mobile-0.0.1', '2018-01-01', ['SMsZGWkF9zR5mjxWTYsDq9pU5ZHdUQw1jJ']).catch(err => console.error(err.toString()));
    //         })
    //         .catch(error => {
    //             console.error(error.message);
    //         });
    // }

    // simpleWalletWatch() {
    //     this.connection.invoke('Watch', 'SMsZGWkF9zR5mjxWTYsDq9pU5ZHdUQw1jJ').catch(err => console.error(err.toString()));
    // }

    // simpleWalletBalance() {
    //     this.connection.invoke('Balance', 'SMsZGWkF9zR5mjxWTYsDq9pU5ZHdUQw1jJ').catch(err => console.error(err.toString()));
    // }
}
