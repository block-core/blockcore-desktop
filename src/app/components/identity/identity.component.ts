import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { Identity } from '@models/identity';
import { SettingsService } from 'src/app/services/settings.service';
import { IdentityService } from 'src/app/services/identity.service';
import { ProfileImageService } from 'src/app/services/profile-image.service';
import { ApiService } from 'src/app/services/api.service';
import { WalletService } from 'src/app/services/wallet.service';
import { ElectronService } from 'ngx-electron';
import { Logger } from 'src/app/services/logger.service';
import * as bip38 from 'city-bip38';
import * as bs58 from 'bs58';
import * as bitcoinMessage from 'bitcoinjs-message';

@Component({
    selector: 'app-identity',
    templateUrl: './identity.component.html',
    styleUrls: ['./identity.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IdentityComponent implements OnDestroy, OnInit {
    @HostBinding('class.identity') hostClass = true;

    scanning = false;
    scanningStatus: string;

    scanningDeep = false;
    scanningDeepStatus: string;

    searchInput = '';
    // public identities: Identity[];

    constructor(
        private appState: ApplicationStateService,
        public identityService: IdentityService,
        public profileImageService: ProfileImageService,
        private apiService: ApiService,
        private log: Logger,
        private electronService: ElectronService,
        private walletService: WalletService,
        private readonly cd: ChangeDetectorRef,
        public settings: SettingsService) {
        this.appState.pageMode = false;
    }

    ngOnInit() {

        console.log(this.identityService.getId(0));
        console.log(this.identityService.getId(1));
        console.log(this.identityService.getId(2));
        console.log(this.identityService.getId(3));
        console.log(this.identityService.getId(4));
        console.log(this.identityService.getId(5));
        console.log(this.identityService.getId(6));

        // // tslint:disable-next-line: no-debugger
        // debugger;

        // // Parameters required for FLO address generation
        // const FLOTESTNET = {
        //     messagePrefix: '\x19FLO testnet Signed Message:\n',
        //     bip32: {
        //         public: 0x013440e2,
        //         private: 0x01343c23
        //     },
        //     pubKeyHash: 0x73,
        //     scriptHash: 0xc6,
        //     wif: 0xef
        // };

        // const identity = this.identityService.getId(0);
        // console.log('Identity:', identity);

        // // const bytes = Buffer.from('003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187', 'hex');
        // const address2 = bs58.encode(identity.publicKey);
        // console.log(address2);

        // const message = 'hello world';

        // const signature = bitcoinMessage.sign(message, identity.privateKey, true, this.appState.networkDefinition);
        // console.log(signature.toString('base64'));

        // // const signature2 = bitcoinMessage.sign(message, identity.privateKey, true, { segwitType: 'p2sh(p2wpkh)' });
        // // console.log(signature2.toString('base64'));

        // // const signature3 = bitcoinMessage.sign(message, identity.privateKey, true, { segwitType: 'p2wpkh' });
        // // console.log(signature3.toString('base64'));

        // // var address = '1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN';

        // const verified = bitcoinMessage.verify(message, address2, signature, this.appState.networkDefinition);

        // console.log(verified);
        // => true

        // const address = '16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS';
        // const bytes = bs58.decode(address);
        // console.log(bytes.toString('hex'));
        // => 003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187

        // this.identities = this.settings.identities;
        // console.log(this.identities);

        // // Read the seed from the file on disk.
        // const seed = this.electronService.ipcRenderer.sendSync('get-wallet-seed', this.walletService.generalInfo.walletFilePath);

        // // Descrypt the seed with the password provided on unlock (login).
        // bip38.decryptAsync(seed, 'default', (decryptedKey) => {
        //     console.log(decryptedKey);

        //     // TODO: Add generation of HD wallet with purpose 302 here.

        // }, null, this.appState.networkParams);
    }

    ngOnDestroy() {

    }

    async scan() {
        let index = 0;
        const length = 10;

        this.scanning = true;
        this.scanningStatus = 'Scanning identity index ' + index + '...';

        // Keep scanning until we no longer find.
        // while (await this.identityService.findByIndex(index)) {
        //     index++;
        //     this.scanningStatus = 'Scanning identity index ' + index + '...';
        // }

        setTimeout(async () => {
            // With the deep scan we won't stop until we have done a full lengthy scan of identities.
            while (index < length) {
                await this.identityService.findByIndex(index);
                index++;
                this.scanningStatus = 'Scanning identity index ' + index + '...';
            }

            this.scanningStatus = '';
            this.scanning = false;
        }, 0);
    }

    async scanDeep() {

        let index = 0;
        const length = 100;

        this.scanningDeep = true;
        this.scanningDeepStatus = 'Scanning identity index ' + index + '...';

        setTimeout(async () => {
            // With the deep scan we won't stop until we have done a full lengthy scan of identities.
            while (index < length) {
                await this.identityService.findByIndex(index);
                index++;
                this.scanningDeepStatus = 'Scanning identity index ' + index + '...';
            }

            this.scanningDeepStatus = '';
            this.scanningDeep = false;
        }, 0);
    }

    delete(id: string) {
        this.identityService.remove(id);
        // this.identities = this.settings.identities;
        this.cd.markForCheck();
    }
}
