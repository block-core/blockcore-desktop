import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, Inject } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm, FormBuilder } from '@angular/forms';
import { GlobalService } from '../../../services/global.service';
import { ApiService } from '../../../services/api.service';
import { PasswordValidationDirective } from '../../../shared/directives/password-validation.directive';
import { WalletCreation } from '../../../classes/wallet-creation';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { MatSnackBar } from '@angular/material';

export interface DialogData {
    animal: 'panda' | 'unicorn' | 'lion';
}

@Component({
    selector: 'app-account-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CreateAccountComponent {
    @HostBinding('class.account-create') hostClass = true;
    //@HostBinding('class') hostClass = 'account-create';

    public form = new FormGroup({
        accountPassword: new FormControl('', { updateOn: 'blur' }),
        accountPasswordConfirmation: new FormControl('', { updateOn: 'blur' }),
        accountName: new FormControl('', Validators.compose([
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(24),
            Validators.pattern(/^[a-zA-Z0-9]*$/)
        ])),
    }, PasswordValidationDirective.MatchPassword);

    public icons: string[];
    public mnemonic: string;
    public password1 = '';
    public password2 = '';
    public accountName = 'main';
    public currentDate: string;
    public verification: string;
    public saving: boolean;

    constructor(private authService: AuthenticationService,
        private router: Router,
        private fb: FormBuilder,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private globalService: GlobalService,
        private apiService: ApiService) {

        this.onGenerate();

    }

    openDialog() {

        // this.dialog.open(CreateAccountSuccessDialog, {
        //     data: {
        //         animal: 'panda'
        //     }
        // });
    }

    public onPrint() {
        window.print();
    }

    public onGenerate() {
        //this.mnemonic = '123';
        //this.mnemonic = bip39.generateMnemonic();

        this.getNewMnemonic();
        this.currentDate = new Date().toDateString();
        // var text = document.getElementById('community-private-key').value;
    }

    private getNewMnemonic() {
        this.apiService
            .getNewMnemonic()
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        this.mnemonic = response.json();
                        this.verification = this.mnemonic.split(' ')[2];
                    }
                },
                error => {
                    this.apiService.handleError(error);
                }
            );
    }

    public createAccount() {
        this.saving = true;
        console.log('CREATE ACCOUNT!');
        this.createWallet(new WalletCreation(this.accountName, this.mnemonic, this.password1));
    }

    private createWallet(wallet: WalletCreation) {

        console.log('Creating wallet with: ', wallet);

        this.apiService
            .createStratisWallet(wallet)
            .subscribe(
                response => {
                    this.saving = false;

                    if (response.status >= 200 && response.status < 400) {
                        console.log('Wallet Created!');

                        let snackBarRef = this.snackBar.open('Account successfully created!', null, { duration: 3000 });
                        this.router.navigateByUrl('/login');

                        //this.genericModalService.openModal("Wallet Created", "Your wallet has been created.<br>Keep your secret words and password safe!");
                        //this.router.navigateByUrl('/');
                    }
                },
                error => {
                    this.saving = false;
                    this.apiService.handleError(error);
                }
            );
    }

    public onSubmit() {
        console.log('FORM SUBMIT');
    }
}
