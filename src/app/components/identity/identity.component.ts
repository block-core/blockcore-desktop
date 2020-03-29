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

@Component({
    selector: 'app-identity',
    templateUrl: './identity.component.html',
    styleUrls: ['./identity.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IdentityComponent implements OnDestroy, OnInit {
    @HostBinding('class.identity') hostClass = true;

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
        // this.identities = this.settings.identities;
        // console.log(this.identities);

        // Read the seed from the file on disk.
        const seed = this.electronService.ipcRenderer.sendSync('get-wallet-seed', this.walletService.generalInfo.walletFilePath);

        // Descrypt the seed with the password provided on unlock (login).
        bip38.decryptAsync(seed, 'default', (decryptedKey) => {
            console.log(decryptedKey);

            // TODO: Add generation of HD wallet with purpose 302 here.

        }, null, this.appState.networkParams);
    }

    ngOnDestroy() {

    }

    delete(id: string) {
        this.identityService.remove(id);
        // this.identities = this.settings.identities;
        this.cd.markForCheck();
    }
}
