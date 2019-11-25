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
import { catchError } from 'rxjs/operators';
import { empty } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ElectronService } from 'ngx-electron';
import { StorageService } from 'src/app/services/storage.service';
import * as bip38 from 'city-bip38';
import { MatSnackBar } from '@angular/material';
import { Logger } from 'src/app/services/logger.service';

export interface Account {
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
    selectedAccount: Account;
    hasWallet = false;
    accounts: Account[] = [];
    unlocking: boolean;
    password = ''; // Default to empty string, not null/undefined.
    invalidPassword: boolean;
    unlockPercentage: number;
    errorMessage: string;
    private subscription: any;
    public status: any;

    constructor(
        private http: HttpClient,
        private readonly cd: ChangeDetectorRef,
        private authService: AuthenticationService,
        private router: Router,
        private globalService: GlobalService,
        private wallet: WalletService,
        private electronService: ElectronService,
        private log: Logger,
        private apiService: ApiService,
        public appState: ApplicationStateService) {

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
            const db = new StorageService('cityhub');
            const list = await db.wallets.toArray();
            const wallets = list.map((item) => {
                return { id: item.name, name: item.name };
            });

            this.accounts = wallets;

            console.log(list);

            this.hasWallet = list.length > 0;
        } catch (error) {
            this.log.error(error);
        }
    }

    changeMode() {
        localStorage.removeItem('Network:Mode');

        this.appState.changingMode = true;
        this.electronService.ipcRenderer.send('daemon-change');

        // Make sure we shut down the existing node when user choose the change mode action.
        this.apiService.shutdownNode().subscribe(response => {
        });

        this.router.navigateByUrl('/load');
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

                        // tslint:disable-next-line:forin
                        for (const wallet in this.wallets) {
                            const id = wallet;
                            const name = this.wallets[wallet].slice(0, -12);
                            const account = { id, name };

                            this.accounts.push(account);

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

        this.globalService.setWalletName(this.selectedAccount.name);

        this.globalService.setCoinName('City Coin');
        this.globalService.setCoinUnit('CITY');

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
        const db = new StorageService('cityhub');
        const wallet = await db.wallets.get({ name: walletLoad.name });
        const self = this;

        console.log('Load Local Wallet...');

        try {
            const start = new Date().getTime();

            console.log(wallet);

            bip38.decryptAsync(wallet.encryptedSeed, walletLoad.password, (decryptedKey) => {
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

            }, null, this.appState.networkParams);
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

                    this.globalService.setNetwork(responseMessage.network);

                    if (responseMessage.network === 'CityMain') {
                        this.globalService.setCoinName('City');
                        this.globalService.setCoinUnit('CITY');
                    } else if (responseMessage.network === 'CityTest') {
                        this.globalService.setCoinName('CityTest');
                        this.globalService.setCoinUnit('TCITY');
                    } else if (responseMessage.network === 'CityRegTest') {
                        this.globalService.setCoinName('CityRegTest');
                        this.globalService.setCoinUnit('TCITY');
                    } else if (responseMessage.network === 'StratisMain') {
                        this.globalService.setCoinName('Stratis');
                        this.globalService.setCoinUnit('STRAT');
                    } else if (responseMessage.network === 'StratisTest') {
                        this.globalService.setCoinName('TestStratis');
                        this.globalService.setCoinUnit('TSTRAT');
                    } else if (responseMessage.network === 'Main') {
                        this.globalService.setCoinName('Bitcoin');
                        this.globalService.setCoinUnit('BTC');
                    } else if (responseMessage.network === 'Test') {
                        this.globalService.setCoinName('BitcoinTest');
                        this.globalService.setCoinUnit('TBTC');
                    }
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

                    this.router.navigateByUrl('/dashboard');
                    // }
                },
                error => {
                    if (error.status === 403 || error.status === 400) { // Invalid password / empty password
                        const msg = error.error.errors[0].message;
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
