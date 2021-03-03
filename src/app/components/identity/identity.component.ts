import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { Identity } from '@models/identity';
import { SettingsService } from 'src/app/services/settings.service';
import { IdentityService } from 'src/app/services/identity.service';
import { ProfileImageService } from 'src/app/services/profile-image.service';
import { ApiService } from 'src/app/services/api.service';
import { WalletService } from 'src/app/services/wallet.service';
import { ElectronService } from 'ngx-electron';
import { Logger } from 'src/app/services/logger.service';
import * as bip38 from '../../../libs/bip38';
import * as bs58 from 'bs58';
import * as bitcoinMessage from 'bitcoinjs-message';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    showDeleted = false;

    public filter = '';

    constructor(
        private appState: ApplicationStateService,
        public identityService: IdentityService,
        public profileImageService: ProfileImageService,
        private apiService: ApiService,
        private log: Logger,
        private snackBar: MatSnackBar,
        private electronService: ElectronService,
        private walletService: WalletService,
        private readonly cd: ChangeDetectorRef,
        public settings: SettingsService) {
        this.appState.pageMode = false;
    }

    ngOnInit() {

    }

    ngOnDestroy() {

    }

    public onCopiedClick() {
        this.snackBar.open('Identity identifier has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }

    // async scan() {

    //     const icons = ['https://image.flaticon.com/icons/svg/236/236832.svg',
    //         'https://image.flaticon.com/icons/svg/236/236832.svg',
    //         'https://image.flaticon.com/icons/svg/236/236832.svg',
    //         'https://image.flaticon.com/icons/svg/236/236832.svg',
    //         'https://image.flaticon.com/icons/svg/236/236831.svg',
    //         'https://image.flaticon.com/icons/svg/236/236800.svg',
    //         'https://image.flaticon.com/icons/svg/236/236810.svg',
    //         'https://image.flaticon.com/icons/svg/236/236806.svg',
    //         'https://image.flaticon.com/icons/svg/236/236846.svg',
    //         'https://image.flaticon.com/icons/svg/236/236818.svg',
    //         'https://image.flaticon.com/icons/svg/236/236808.svg',
    //         'https://image.flaticon.com/icons/svg/236/236804.svg',
    //         'https://image.flaticon.com/icons/svg/234/234679.svg',
    //         'https://image.flaticon.com/icons/svg/424/424783.svg',
    //         'https://image.flaticon.com/icons/svg/236/236849.svg',
    //         'https://image.flaticon.com/icons/svg/236/236801.svg',
    //         'https://image.flaticon.com/icons/svg/236/236829.svg',
    //         'https://image.flaticon.com/icons/svg/233/233914.svg',
    //         'https://image.flaticon.com/icons/svg/233/233954.svg',
    //         'https://image.flaticon.com/icons/svg/424/424796.svg',
    //         'https://image.flaticon.com/icons/svg/233/233958.svg',
    //         'https://image.flaticon.com/icons/svg/233/233922.svg',
    //         'https://image.flaticon.com/icons/svg/233/233950.svg',
    //         'https://image.flaticon.com/icons/svg/424/424779.svg',
    //         'https://image.flaticon.com/icons/svg/233/233927.svg',
    //         'https://image.flaticon.com/icons/svg/233/233878.svg',
    //         'https://image.flaticon.com/icons/svg/233/233938.svg',
    //         'https://image.flaticon.com/icons/svg/233/233894.svg',
    //         'https://image.flaticon.com/icons/svg/233/233949.svg',
    //         'https://image.flaticon.com/icons/svg/233/233883.svg',
    //         'https://image.flaticon.com/icons/svg/233/233893.svg',
    //         'https://image.flaticon.com/icons/svg/424/424763.svg',
    //         'https://image.flaticon.com/icons/svg/234/234588.svg',
    //         'https://image.flaticon.com/icons/svg/234/234724.svg',
    //         'https://image.flaticon.com/icons/svg/236/236808.svg',
    //         'https://image.flaticon.com/icons/svg/234/234668.svg',
    //         'https://image.flaticon.com/icons/svg/234/234829.svg',
    //         'https://image.flaticon.com/icons/svg/234/234794.svg',
    //         'https://image.flaticon.com/icons/svg/234/234771.svg',
    //         'https://image.flaticon.com/icons/svg/234/234736.svg',
    //         'https://image.flaticon.com/icons/svg/234/234757.svg',
    //         'https://image.flaticon.com/icons/svg/424/424788.svg',
    //         'https://image.flaticon.com/icons/svg/306/306294.svg',
    //         'https://image.flaticon.com/icons/svg/234/234248.svg',
    //         'https://image.flaticon.com/icons/svg/314/314271.svg',
    //         'https://image.flaticon.com/icons/svg/234/234213.svg',
    //         'https://image.flaticon.com/icons/svg/234/234207.svg',
    //         'https://image.flaticon.com/icons/svg/234/234214.svg',
    //         'https://image.flaticon.com/icons/svg/2162/2162579.svg',
    //         'https://image.flaticon.com/icons/svg/825/825540.svg',
    //         'https://image.flaticon.com/icons/svg/825/825465.svg',
    //         'https://image.flaticon.com/icons/svg/1870/1870449.svg',
    //         'https://image.flaticon.com/icons/svg/234/234163.svg',
    //         'https://image.flaticon.com/icons/svg/234/234121.svg'];

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    //     for (let i = 0; i < icons.length; ++i) {
    //         const icon = icons[i];

    //         const identityContainer = this.identityService.create();
    //         identityContainer.content.image = icon;
    //         identityContainer.publish = true;
    //         identityContainer.published = true;

    //         this.identityService.add(identityContainer);
    //     }
    // }

    async scan() {
        this.scanning = true;
        this.scanningStatus = 'Scanning identity index 0...';

        const seek = async () => {

            let index = 0;
            let height = 10;
            let hasFound = false;
            const length = 10;

            // With the deep scan we won't stop until we have done a full lengthy scan of identities.
            while (index < height) {
                const identity = await this.identityService.findByIndex(index);

                // Every time we find an identity, extend the search range with 10 more.
                if (identity) {
                    hasFound = true;
                }

                index++;

                this.scanningStatus = 'Scanning identity index ' + index + '...';

                // When we are at last index, check if we found anything, if we did, extend with another 10 indexes to search.
                if (index === height && hasFound) {
                    height = (height + length);
                    hasFound = false;
                }
            }

            this.scanningStatus = '';
            this.scanning = false;
        };

        setTimeout(seek, 0);
    }

    async scanDeep() {
        this.scanning = true;
        this.scanningStatus = 'Scanning identity index 0...';

        const seek = async () => {

            let index = 0;
            let height = 100;
            let hasFound = false;
            const length = 100;

            // With the deep scan we won't stop until we have done a full lengthy scan of identities.
            while (index < height) {
                const identity = await this.identityService.findByIndex(index);

                // Every time we find an identity, extend the search range with 10 more.
                if (identity) {
                    hasFound = true;
                }

                index++;

                this.scanningStatus = 'Scanning identity index ' + index + '...';

                // When we are at last index, check if we found anything, if we did, extend with another 10 indexes to search.
                if (index === height && hasFound) {
                    height = (height + length);
                    hasFound = false;
                }

            }

            this.scanningStatus = '';
            this.scanning = false;
        };

        setTimeout(seek, 0);
    }

    delete(id: string) {
        this.identityService.remove(id);
        // this.identities = this.settings.identities;
        this.cd.markForCheck();
    }

    deleteAll() {
        this.identityService.identities = [];
    }
}
