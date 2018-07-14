import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';

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
    @HostBinding('class.login') hostClass = 'login';

    selectedAccount: Account;

    private wallets: [string];
    public hasWallet: boolean = false;

    accounts: Account[] = [];

    constructor(
        private readonly cd: ChangeDetectorRef,
        private authService: AuthenticationService, private router: Router,
        private globalService: GlobalService, private apiService: ApiService) {

    }

    ngOnInit() {
        this.getWalletFiles();
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
                    if (error.status === 0) {
                        //this.genericModalService.openModal(null, null);
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        } else {
                            //this.genericModalService.openModal(null, error.json().errors[0].message);
                        }
                    }
                }
            )
            ;
    }

    login() {
        this.authService.authenticated = true;
        this.router.navigateByUrl('/dashboard');
    }
}
