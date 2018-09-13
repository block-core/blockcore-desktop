import { Component, ViewEncapsulation, HostBinding, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { GlobalService } from '../../../services/global.service';
import { ApiService } from '../../../services/api.service';
import { PasswordValidationDirective } from '../../../shared/directives/password-validation.directive';
import { WalletCreation } from '../../../classes/wallet-creation';
import { MatDialog } from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { Logger } from '../../../services/logger.service';

@Component({
    selector: 'app-account-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CreateAccountComponent implements OnInit {
    @HostBinding('class.account-create') hostClass = true;

    accountPasswordForm: FormGroup;
    accountSeedForm: FormGroup;
    accountNameForm: FormGroup;
    icons: string[];
    mnemonic: string;
    password1 = '';
    password2 = '';
    seedExtension = '';
    accountName = 'main';
    currentDate: string;
    verification: string;
    saving: boolean;

    constructor(private authService: AuthenticationService,
        private router: Router,
        private fb: FormBuilder,
        private log: Logger,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private globalService: GlobalService,
        private apiService: ApiService) {

        this.onGenerate();
    }

    ngOnInit() {
        this.accountSeedForm = this.fb.group({
            seedExtension: ['', { updateOn: 'blur' }]
        });

        this.accountPasswordForm = this.fb.group({
            accountPassword: ['', {
                validators: Validators.compose([
                    Validators.required,
                    Validators.minLength(1)
                ])
            }],
            accountPasswordConfirmation: [''],
        }, { updateOn: 'blur', validator: PasswordValidationDirective.MatchPassword });

        this.accountNameForm = this.fb.group({
            accountName: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(24),
                Validators.pattern(/^[a-zA-Z0-9]*$/)
            ]))
        });
    }

    public onPrint() {
        window.print();
    }

    public onGenerate() {
        this.getNewMnemonic();
        this.currentDate = new Date().toDateString();
    }

    private getNewMnemonic() {
        this.apiService
            .getNewMnemonic()
            .subscribe(
                response => {
                    // if (response.status >= 200 && response.status < 400) {
                    this.mnemonic = response;
                    this.verification = this.mnemonic.split(' ')[2];
                    // }
                },
                error => {
                    this.apiService.handleError(error);
                }
            );
    }

    public createAccount() {
        this.saving = true;
        this.log.info('Create account:', this.accountName);
        this.createWallet(new WalletCreation(this.accountName, this.mnemonic, this.password1, this.seedExtension));
    }

    private createWallet(wallet: WalletCreation) {
        this.log.info('Creating wallet with: ', wallet);

        this.apiService
            .createWallet(wallet)
            .subscribe(
                response => {
                    this.saving = false;
                    this.log.info('Wallet Created!');
                    this.snackBar.open('Account successfully created!', null, { duration: 3000 });
                    this.router.navigateByUrl('/login');
                },
                error => {
                    this.saving = false;
                    this.apiService.handleError(error);
                }
            );
    }
}
