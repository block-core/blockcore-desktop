import { Component, ViewEncapsulation, ChangeDetectionStrategy, AfterContentInit, HostBinding, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { WalletService } from '../../services/wallet.service';
import { Router } from '@angular/router';
import { ChainService, Chain } from 'src/app/services/chain.service';
import { ApplicationStateService } from 'src/app/services/application-state.service';
import { HubAddComponent } from './hub-add.component';
import { SettingsService } from 'src/app/services/settings.service';
import { HubService } from 'src/app/services/hub.service';
import { Hub } from '@models/hub';

@Component({
    selector: 'app-hub-details',
    templateUrl: './hub-details.component.html',
    styleUrls: ['./hub-details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HubDetailsComponent implements OnInit, OnDestroy {
    @HostBinding('class.network') hostClass = true;

    columns = 4;

    gridByBreakpoint = {
        xl: 8,
        lg: 6,
        md: 4,
        sm: 2,
        xs: 1
    };

    private mediaObservable;
    private subscription;
    private subscription2;
    public chain: Chain;
    public status: any;
    public bans: any;
    public hubs: any;

    constructor(
        private globalService: GlobalService,
        private apiService: ApiService,
        private readonly cd: ChangeDetectorRef,
        private appState: ApplicationStateService,
        private chains: ChainService,
        public settings: SettingsService,
        public hubService: HubService,
        public router: Router,
        public dialog: MatDialog,
        public walletService: WalletService) {

        console.log(this.settings.hubs);

        this.hubs = this.settings.hubs;
        this.chain = this.chains.getChain(this.appState.chain, this.appState.network);
    }

    ngOnInit() {
        // this.subscription = this.apiService.getNodeStatusCustomInterval(10000).subscribe((response) => {
        //     this.status = response;
        // });

        // this.subscription2 = this.apiService.getBannedNodesCustomInterval(10000).subscribe((response) => {
        //     this.bans = response;
        //     console.log(this.bans);
        // });
    }

    ngOnDestroy() {
        // this.subscription.unsubscribe();
    }

    getImage(image) {
        if (!image) {
            image = 'data:image/png;base64,iVBORw0KGg'
                + 'oAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAU'
                + 'AAarVyFEAAAAASUVORK5CYII=';
        }

        return image;
    }

    hubStatus(hub: Hub) {
        return 'Valid';
    }

    async addHub() {
        const dialogRef = this.dialog.open(HubAddComponent, {
            width: '300px',
            data: { url: '' }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);

            if (result) {
                console.log('RESULT:', result);

                this.hubService.add(result).then(data => {
                    // Update the local list of hubs with the one persisted in settings.
                    this.hubs = this.settings.hubs;
                    this.cd.markForCheck();
                });
            }
        });
    }

    removeHub(id: string) {
        console.log('Trying to remove:' + id);
        this.hubService.remove(id);
        this.hubs = this.settings.hubs;
        this.cd.markForCheck();
    }

    back() {
        this.router.navigateByUrl('/settings');
    }
}
