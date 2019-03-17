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
import { ApplicationStateService } from 'src/app/services/application-state.service';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import * as bip38 from 'city-bip38';
import * as city from 'city-lib';
import { HDNode } from 'city-lib';
import * as wif from 'wif';
import Dexie from 'dexie';
import { StorageService } from '../../../services/storage.service';

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
        private appState: ApplicationStateService,
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
        if (this.appState.localMode) {
            this.getNewMnemonicLocal();
        } else {
            this.getNewMnemonic();

        }

        this.currentDate = new Date().toDateString();
    }

    private getNewMnemonicLocal() {
        this.mnemonic = bip39.generateMnemonic();
        this.verification = this.mnemonic.split(' ')[2];
    }

    private getNewMnemonic() {
        this.apiService
            .getNewMnemonic()
            .subscribe(
                response => {
                    this.mnemonic = response;
                    this.verification = this.mnemonic.split(' ')[2];
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

        if (this.appState.localMode) {
            // C#: HdOperations.GetExtendedKey(recoveryPhrase, string.Empty);
            const seed = bip39.mnemonicToSeed(wallet.mnemonic, wallet.passPhrase);

            // C#: HdOperations.GetExtendedPublicKey(privateKey, masterSeed.ChainCode, network.Consensus.CoinType, 0);
            const fromSeed = bip32.fromSeed(seed, this.appState.networkDefinition);

            const extPubKey = fromSeed.neutered().toBase58();

            const privateKeyWif = wif.encode(0xed, fromSeed.privateKey, true);

            const decoded = wif.decode(privateKeyWif);

            const self = this;

            // const master = HDNode.fromSeedBuffer(seed);
            // const test = this.getAddress(null, null);

            bip38.encryptAsync(fromSeed.privateKey, true, wallet.password, (out) => {

                // Instantiate it
                const db = new StorageService('cityhub');

                // Open it
                db.open().catch(err => {
                    console.error(`Open failed: ${err.stack}`);
                });

                db.wallets.add({
                    name: wallet.name,
                    isExtPubKeyWallet: false,
                    extPubKey: extPubKey,
                    encryptedSeed: out,
                    chainCode: '',
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

                console.log(seed);

            }, null, this.appState.networkParams);
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
