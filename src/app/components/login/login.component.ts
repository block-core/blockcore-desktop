import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { WalletInfo } from '../../classes/wallet-info';
import { WalletLoad } from '../../classes/wallet-load';

export interface Account {
    name: string;
    id: string;
}
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
    @HostBinding('class.login') hostClass = true;

    private wallets: [string];
    selectedAccount: Account;
    hasWallet = false;
    accounts: Account[] = [];
    unlocking: boolean;
    password = ''; // Default to empty string, not null/undefined.

    constructor(
        private readonly cd: ChangeDetectorRef,
        private authService: AuthenticationService, private router: Router,
        public appState: ApplicationStateService,
        private globalService: GlobalService,
        private apiService: ApiService) {

    }

    ngOnInit() {
        this.getWalletFiles();
    }

    changeMode() {
        localStorage.removeItem('Mode');
        this.router.navigateByUrl('/load');
    }

    cancel()
    {
        this.selectedAccount = null;
    }

    private getWalletFiles() {
        this.apiService.getWalletFiles()
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        let responseMessage = response.json();
                        this.wallets = responseMessage.walletsFiles;
                        this.globalService.setWalletPath(responseMessage.walletsPath);

                        if (this.wallets.length > 0) {
                            this.hasWallet = true;

                            for (let wallet in this.wallets) {

                                var id = wallet;
                                var name = this.wallets[wallet].slice(0, -12);

                                this.accounts.push({ id: id, name: name });

                                this.wallets[wallet] = this.wallets[wallet].slice(0, -12);
                            }
                        } else {
                            this.hasWallet = false;
                        }

                        this.cd.markForCheck();
                    }
                },
                error => {
                    this.apiService.handleError(error);
                }
            );
    }

    unlock() {
        this.unlocking = true;

        this.globalService.setWalletName(this.selectedAccount.name);

        this.globalService.setCoinName('TestStratis');
        this.globalService.setCoinUnit('TSTRAT');

        this.getCurrentNetwork();

        const walletLoad = new WalletLoad(
            this.selectedAccount.name,
            this.password
        );

        this.loadWallet(walletLoad);
    }

    private getCurrentNetwork() {
        let walletInfo = new WalletInfo(this.globalService.getWalletName());
        this.apiService.getGeneralInfoOnce(walletInfo)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        let responseMessage = response.json();
                        this.globalService.setNetwork(responseMessage.network);
                        if (responseMessage.network === 'StratisMain') {
                            this.globalService.setCoinName('Stratis');
                            this.globalService.setCoinUnit('STRAT');
                        } else if (responseMessage.network === 'StratisTest') {
                            this.globalService.setCoinName('TestStratis');
                            this.globalService.setCoinUnit('TSTRAT');
                        }
                    }
                },
                error => {
                    this.apiService.handleError(error);
                }
            );
    }

    private loadWallet(walletLoad: WalletLoad) {
        this.apiService.loadStratisWallet(walletLoad)
            .subscribe(
                response => {
                    this.unlocking = false;

                    if (response.status >= 200 && response.status < 400) {
                        this.authService.setAuthenticated();
                        this.router.navigateByUrl('/dashboard');
                    }
                },
                error => {
                    this.authService.setAnonymous();
                    this.unlocking = false;
                    this.apiService.handleError(error);
                }
            );
    }
}
