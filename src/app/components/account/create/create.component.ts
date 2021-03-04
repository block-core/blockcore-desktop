/* eslint-disable */

import { Component, ViewEncapsulation, HostBinding, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { GlobalService } from '../../../services/global.service';
import { ApiService } from '../../../services/api.service';
import { PasswordValidationDirective } from '../../../shared/directives/password-validation.directive';
import { WalletCreation } from '../../../classes/wallet-creation';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Logger } from '../../../services/logger.service';

import { ApplicationStateService } from 'src/app/services/application-state.service';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import * as bip38 from '../../../../libs/bip38';
import * as city from 'city-lib';
import { HDNode } from 'city-lib';
import * as wif from 'wif';
import Dexie from 'dexie';
import { DatabaseStorageService } from 'src/app/services/storage.service';

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

    constructor(
        private authService: AuthenticationService,
        private appState: ApplicationStateService,
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
        if (this.appState.isSimpleMode) {
            this.getNewMnemonicLocal();
        } else {
            this.getNewMnemonic();
        }

        this.currentDate = new Date().toDateString();
    }

    private getNewMnemonicLocal() {
        this.mnemonic = bip39.generateMnemonic();
        this.mnemonic = 'mystery problem faith negative member bottom concert bundle asthma female process twelve';
        this.verification = this.mnemonic.split(' ')[2];
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
                    this.apiService.handleException(error);
                }
            );
    }

    public createAccount() {
        this.saving = true;
        this.log.info('Create account:', this.accountName);
        this.createWallet(new WalletCreation(this.accountName, this.mnemonic, this.password1, this.seedExtension));
    }

    private getAddress(node, network) {
        return city.payments.p2pkh({ pubkey: node.publicKey, network }).address;
    }

    private createWallet(wallet: WalletCreation) {
        this.log.info('Creating wallet with: ', wallet);

        if (this.appState.isSimpleMode) {
            // C#: HdOperations.GetExtendedKey(recoveryPhrase, string.Empty);
            bip39.mnemonicToSeed(this.mnemonic, wallet.passPhrase).then(masterSeed => {
                const self = this;
                const masterNode = bip32.fromSeed(masterSeed, this.appState.networkDefinition);

                // eslint-disable-next-line
                const accountNode = masterNode.derivePath("m/44'/1926'/0'"); // TODO: Get the coin type from network definition.
                const xpub = accountNode.neutered().toBase58();

                // bip38.encryptAsync(masterNode.privateKey, true, wallet.password, (out) => {
                // }, null, this.appState.networkParams);

                // eslint-disable-next-line prefer-const
                let encryptedKeySeed = bip38.encrypt(masterNode.privateKey, true, wallet.password, null, null, this.appState.networkParams);

                // Instantiate it
                const db = new DatabaseStorageService('cityhub');

                // Open it
                db.open().catch(err => {
                    console.error(`Open failed: ${err.stack}`);
                });

                db.wallets.add({
                    name: wallet.name,
                    isExtPubKeyWallet: false,
                    extPubKey: xpub,
                    encryptedSeed: encryptedKeySeed,
                    chainCode: masterNode.chainCode,
                    network: 'CityMain',
                    creationTime: Date.now() / 1000,
                    coinType: 1926,
                    lastBlockSyncedHeight: 0,
                    lastBlockSyncedHash: ''
                });

                self.saving = false;
                self.log.info('Wallet Created!');
                self.snackBar.open('Account successfully created!', null, { duration: 3000 });
                self.router.navigateByUrl('/login');


            });
        } else {
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
                        this.apiService.handleException(error);
                    }
                );
        }
    }
}
