/* eslint-disable */

import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PasswordValidationDirective } from '../../../shared/directives/password-validation.directive';
import { WalletRecovery } from '../../../classes/wallet-recovery';
import { ApiService } from '../../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationStateService } from '../../../services/application-state.service';

@Component({
    selector: 'app-account-recover',
    templateUrl: './recover.component.html',
    styleUrls: ['./recover.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RecoverAccountComponent {
    @HostBinding('class.account-recover') hostClass = true;

    public minDate: Date;
    public maxDate: Date;
    public mnemonic: string;
    public seedExtension = '';
    public password1 = '';
    public password2 = '';
    public accountName = 'main';
    public saving: boolean;
    public accountDate: Date;
    private walletRecovery: WalletRecovery;

    public form = new FormGroup({
        accountPassword: new FormControl('', { updateOn: 'blur' }),
        seedExtension: new FormControl('', { updateOn: 'blur' }),
        accountMnemonic: new FormControl('', Validators.required),
        accountDate: new FormControl('', Validators.required),
        accountPasswordConfirmation: new FormControl('', { updateOn: 'blur' }),
        accountName: new FormControl('', Validators.compose([
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(24),
            Validators.pattern(/^[a-zA-Z0-9]*$/)
        ])),
    }, PasswordValidationDirective.MatchPassword);

    constructor(
        private authService: AuthenticationService,
        public snackBar: MatSnackBar,
        private router: Router,
        private appState: ApplicationStateService,
        private apiService: ApiService) {

        this.minDate = this.apiService.genesisDate;
        this.maxDate = new Date(); // Set to current date.

        this.accountName = 'main';
    }

    public restoreAccount() {
        this.saving = true;

        const recoveryDate = new Date(this.form.get('accountDate').value);
        recoveryDate.setDate(recoveryDate.getDate() - 1);

        this.walletRecovery = new WalletRecovery(this.accountName, this.mnemonic, this.password1, this.seedExtension, recoveryDate);

        this.recoverWallet(this.walletRecovery);
    }

    private recoverWallet(recoverWallet: WalletRecovery) {
        this.apiService
            .recoverWallet(recoverWallet)
            .subscribe(
                response => {
                    this.snackBar.open('Your wallet has been recovered.', null, { duration: 3000 });
                    localStorage.setItem('Network:Wallet', recoverWallet.name);
                    this.router.navigateByUrl('/login');
                },
                error => {
                    this.saving = false;
                    this.apiService.handleException(error);
                }
            );
    }
}
