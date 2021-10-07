/* eslint-disable */

import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { WalletInfo } from '../../classes/wallet-info';
import { WalletLoad } from '../../classes/wallet-load';
import { WalletService } from '../../services/wallet.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ElectronService } from 'ngx-electron';
import { DatabaseStorageService, StorageService } from 'src/app/services/storage.service';
import * as bip38 from '../../../libs/bip38';
import { Logger } from 'src/app/services/logger.service';
import { IdentityService } from 'src/app/services/identity.service';
import { ChainService } from 'src/app/services/chain.service';

export interface WalletAccount {
    name: string;
    id: string;
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
    @HostBinding('class.login') hostClass = true;

    private wallets: [string];
    selectedAccount: WalletAccount;
    hasWallet = false;
    accounts: WalletAccount[] = [];
    unlocking: boolean;
    password = ''; // Default to empty string, not null/undefined.
    invalidPassword: boolean;
    unlockPercentage: number;
    errorMessage: string;
    private subscription: any;
    public status: any;
    private ipc: Electron.IpcRenderer;

    constructor(
        private http: HttpClient,
        private readonly cd: ChangeDetectorRef,
        private authService: AuthenticationService,
        private walletService: WalletService,
        private router: Router,
        private globalService: GlobalService,
        private identityService: IdentityService,
        private wallet: WalletService,
        private storageService: StorageService,
        private electronService: ElectronService,
        private chains: ChainService,
        private log: Logger,
        private apiService: ApiService,
        public appState: ApplicationStateService) {

        if (electronService.ipcRenderer) {
            this.ipc = electronService.ipcRenderer;
        }

    }

    ngOnInit() {
        this.loadWallets();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private loadWallets() {
        if (this.appState.isSimpleMode) {
            this.getLocalWalletFiles();
        } else {
            this.subscription = this.apiService.getNodeStatusCustomInterval(10000).subscribe((response) => {
                this.status = response;
                this.log.info('Status update result: ', this.status);
            });

            this.getWalletFiles();
        }
    }

    private async getLocalWalletFiles() {
        try {
            // Read accounts from localStorage.
            const db = new DatabaseStorageService('cityhub');
            const list = await db.wallets.toArray();
            const wallets = list.map((item) => ({ id: item.name, name: item.name }));

            this.accounts = wallets;
            this.appState.accounts = wallets;

            console.log(list);

            this.hasWallet = list.length > 0;
        } catch (error) {
            this.log.error(error);
        }
    }

    changeMode() {
        let currentMode = localStorage.getItem('Network:Mode');
        let shouldExitNode = currentMode !== 'manual';

        // Persist the current mode as PreviousMode.
        localStorage.setItem('Network:ModePrevious', localStorage.getItem('Network:Mode'));
        localStorage.removeItem('Network:Mode');

        this.appState.changingMode = true;
        this.electronService.ipcRenderer.send('daemon-change');

        // Do not send shutdown command if we're in manual mode.
        if (shouldExitNode) {
            // Make sure we shut down the existing node when user choose the change mode action.
            this.apiService.shutdownNode().subscribe(response => {
                // The response from shutdown is returned before the node is fully exited, so put a small delay here.
                // setTimeout(() => {
                //     this.router.navigate(['/load']);
                // }, 1500);
            });
        }

        this.electronService.ipcRenderer.send('update-icon', null);

        // Navigate and show loading indicator.
        this.router.navigate(['/load'], { queryParams: { loading: shouldExitNode } });
    }

    cancel() {
        this.errorMessage = '';
        this.selectedAccount = null;
        this.password = '';
    }

    private getWalletFiles() {
        this.apiService.getWalletFiles()
            .subscribe(
                response => {
                    // if (response.status >= 200 && response.status < 400) {
                    this.wallets = response.walletsFiles;
                    this.globalService.setWalletPath(response.walletsPath);

                    if (this.wallets.length > 0) {
                        this.hasWallet = true;
                        const lastUsedWallet = localStorage.getItem('Network:Wallet');

                        // eslint-disable-next-line guard-for-in
                        for (const wallet in this.wallets) {
                            const id = wallet;
                            const name = this.wallets[wallet].slice(0, -12);
                            const account = { id, name };

                            this.accounts.push(account);
                            this.appState.accounts = this.accounts;

                            if (lastUsedWallet && lastUsedWallet === name) {
                                this.selectedAccount = account;

                                if (environment.password) {
                                    setTimeout(() => {
                                        this.password = environment.password;
                                        this.unlock();
                                    }, 500);
                                }
                            }

                            // this.wallets[wallet] = this.wallets[wallet].slice(0, -12);
                        }

                        // If no wallet has been selected, pick the first one.
                        if (!this.selectedAccount) {
                            this.selectedAccount = this.accounts[0];
                        }

                    } else {
                        this.hasWallet = false;
                    }

                    this.cd.markForCheck();
                    // }
                },
                error => {
                    this.apiService.handleException(error);
                }
            );
    }

    unlock() {
        this.errorMessage = '';
        this.unlocking = true;
        this.invalidPassword = false;

        const chain = this.chains.getChain(this.appState.daemon.network);
        const coinUnit = chain.unit || chain.chain;

        if (!chain.coin) {
            chain.coin = chain.name;
        }

        this.globalService.setWalletName(this.selectedAccount.name);
        this.storageService.setWalletName(this.selectedAccount.name, coinUnit);

        this.globalService.setCoinName(chain.coin);
        this.globalService.setCoinUnit(coinUnit);

        this.getCurrentNetwork();

        const walletLoad = new WalletLoad(
            this.selectedAccount.name,
            this.password
        );

        if (this.appState.isSimpleMode) {
            this.loadLocalWallet(walletLoad);
        } else {
            this.loadWallet(walletLoad);
        }
    }

    private async loadLocalWallet(walletLoad: WalletLoad) {
        const db = new DatabaseStorageService('cityhub');
        const wallet = await db.wallets.get({ name: walletLoad.name });
        const self = this;

        console.log('Load Local Wallet...');

        try {
            const start = new Date().getTime();

            console.log(wallet);

            // bip38.decryptAsync(wallet.encryptedSeed, walletLoad.password, (decryptedKey) => {
            // }, null, this.appState.networkParams);

            const decryptedKey = bip38.decrypt(wallet.encryptedSeed, walletLoad.password, null, null, this.appState.networkParams);

            console.log('decrypted!');
            console.log(decryptedKey);

            const stop = new Date().getTime();

            const diff = stop - start;
            console.log(diff + 'ms taken to decrypt.');
            // console.log('decryptedKey:', decryptedKey);

            self.authService.setAuthenticated();
            self.unlocking = false;
            localStorage.setItem('Network:Wallet', wallet.name);

            // Make sure the unlocked wallet is available, especially the extpubkey is required to generate addresses.
            this.wallet.activeWallet = wallet;

            self.router.navigateByUrl('/dashboard');

        } catch (err) {
            if (err.message !== 'AssertionError [ERR_ASSERTION]') {
                self.log.error('Unknown failure on wallet unlock', err);
            }

            self.unlocking = false;
            self.invalidPassword = true;
        }
    }

    private getCurrentNetwork() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());

        this.apiService.getGeneralInfoOnce(walletInfo)
            .subscribe(
                response => {
                    // if (response.status >= 200 && response.status < 400) {
                    const responseMessage = response;

                    // TODO: Figure out what we want to do with this node call. The coin name and unit is now being set by the definitions.
                    this.globalService.setNetwork(responseMessage.network);

                    // if (responseMessage.network === 'CityMain') {
                    //     this.globalService.setCoinName('City');
                    //     this.globalService.setCoinUnit('CITY');
                    // } else if (responseMessage.network === 'CityTest') {
                    //     this.globalService.setCoinName('CityTest');
                    //     this.globalService.setCoinUnit('TCITY');
                    // } else if (responseMessage.network === 'CityRegTest') {
                    //     this.globalService.setCoinName('CityRegTest');
                    //     this.globalService.setCoinUnit('TCITY');
                    // } else if (responseMessage.network === 'StratisMain') {
                    //     this.globalService.setCoinName('Stratis');
                    //     this.globalService.setCoinUnit('STRAT');
                    // } else if (responseMessage.network === 'StratisTest') {
                    //     this.globalService.setCoinName('TestStratis');
                    //     this.globalService.setCoinUnit('TSTRAT');
                    // } else if (responseMessage.network === 'Main') {
                    //     this.globalService.setCoinName('Bitcoin');
                    //     this.globalService.setCoinUnit('BTC');
                    // } else if (responseMessage.network === 'Test') {
                    //     this.globalService.setCoinName('BitcoinTest');
                    //     this.globalService.setCoinUnit('TBTC');
                    // }
                    // }
                },
                error => {
                    this.apiService.handleException(error);
                }
            );
    }

    private loadWallet(walletLoad: WalletLoad) {
        this.apiService.loadWallet(walletLoad)
            .subscribe(
                response => {
                    this.unlocking = false;

                    // if (response.status >= 200 && response.status < 400) {
                    this.authService.setAuthenticated();
                    this.wallet.start();

                    localStorage.setItem('Network:Wallet', this.wallet.walletName);

                    // Get the physical path to the wallet file.
                    const fullPath = this.globalService.getWalletFullPath();

                    this.identityService.unlock(fullPath, walletLoad.password);

                    this.router.navigateByUrl('/dashboard');
                    // }
                },
                error => {
                    if (error.status === 403) { // Invalid password
                        const msg = error.error.errors[0].message;
                        this.errorMessage = msg;
                    }

                    if (error.status === 400) { // Empty password
                        const msg = error.error.errors.password[0];
                        this.errorMessage = msg;
                    }

                    this.wallet.stop();
                    this.authService.setAnonymous();
                    this.unlocking = false;
                    this.apiService.handleException(error);
                }
            );
    }
}
