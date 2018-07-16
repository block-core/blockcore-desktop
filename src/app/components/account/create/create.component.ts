import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm, FormBuilder } from '@angular/forms';
import { GlobalService } from '../../../services/global.service';
import { ApiService } from '../../../services/api.service';
import { PasswordValidationDirective } from '../../../shared/directives/password-validation.directive';
import { WalletCreation } from '../../../classes/wallet-creation';

@Component({
    selector: 'app-account-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CreateAccountComponent {
    @HostBinding('class.account-create') hostClass = 'account-create';

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

    constructor(private authService: AuthenticationService,
        private router: Router,
        private fb: FormBuilder,
        private globalService: GlobalService,
        private apiService: ApiService) {

        this.onGenerate();
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
                    console.log(error);

                    // if (error.status === 0) {
                    //     this.genericModalService.openModal(null, null);
                    // } else if (error.status >= 400) {
                    //     if (!error.json().errors[0]) {
                    //         console.log(error);
                    //     }
                    //     else {
                    //         this.genericModalService.openModal(null, error.json().errors[0].message);
                    //     }
                    // }
                }
            )
            ;
    }

    public createAccount() {
        console.log('CREATE ACCOUNT!');
        this.createWallet(new WalletCreation(this.accountName, this.mnemonic, this.password1));
    }

    private createWallet(wallet: WalletCreation) {

        console.log('Creating wallet with: ', wallet);

        this.apiService
            .createStratisWallet(wallet)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        console.log('Wallet Created!');
                        //this.genericModalService.openModal("Wallet Created", "Your wallet has been created.<br>Keep your secret words and password safe!");
                        this.router.navigateByUrl('/');
                    }
                },
                error => {
                    // this.isCreating = false;
                    // console.log(error);
                    // if (error.status === 0) {
                    //     this.genericModalService.openModal(null, null);
                    // } else if (error.status >= 400) {
                    //     if (!error.json().errors[0]) {
                    //         console.log(error);
                    //     }
                    //     else {
                    //         this.genericModalService.openModal(null, error.json().errors[0].message);
                    //         this.router.navigate(['/setup/create']);
                    //     }
                    // }
                }
            )
            ;
    }

    public onSubmit() {
        console.log('FORM SUBMIT');
    }
}
