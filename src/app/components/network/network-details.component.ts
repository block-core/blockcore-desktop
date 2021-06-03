/* eslint-disable */

import { Component, ViewEncapsulation, ChangeDetectionStrategy, AfterContentInit, HostBinding, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { WalletService } from '../../services/wallet.service';
import { Router } from '@angular/router';
import { ChainService, Chain } from 'src/app/services/chain.service';
import { ApplicationStateService } from 'src/app/services/application-state.service';
import { NetworkAddNodeComponent } from './network-add-node.component';
import { NetworkBanNodeComponent } from './network-ban-node.component';

@Component({
    selector: 'app-network-details',
    templateUrl: './network-details.component.html',
    styleUrls: ['./network.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NetworkDetailsComponent implements OnInit, OnDestroy {
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

    constructor(
        private globalService: GlobalService,
        private apiService: ApiService,
        private readonly cd: ChangeDetectorRef,
        private appState: ApplicationStateService,
        private chains: ChainService,
        public router: Router,
        public dialog: MatDialog,
        public walletService: WalletService) {

        this.chain = this.chains.getChain(this.appState.daemon.network);
    }

    ngOnInit() {
        this.subscription = this.apiService.getNodeStatusCustomInterval(10000).subscribe((response) => {
            this.status = response;
        });

        this.subscription2 = this.apiService.getBannedNodesCustomInterval(10000).subscribe((response) => {
            this.bans = response;
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.subscription2.unsubscribe();
    }

    addNode() {
        const dialogRef = this.dialog.open(NetworkAddNodeComponent, {
            width: '250px',
            data: { ip: '' }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);

            if (result) {
                this.apiService.addNode(result).subscribe((success) => {
                    console.log('Result from add node:', success);
                });
            }
        });
    }

    removeNode(ip: string) {
        this.apiService.removeNode(ip).subscribe((result) => {
            console.log('Result from add node:', result);
        });
    }

    banNode(ip: string) {

        const dialogRef = this.dialog.open(NetworkBanNodeComponent, {
            width: '250px',
            data: { ip, seconds: 86400 }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);

            if (result) {
                this.apiService.banNode(result.ip, result.seconds).subscribe((success) => {
                    console.log('Result from ban node:', success);
                });
            }
        });
    }

    removeBan(ip: string) {
        this.apiService.unbanNode(ip).subscribe((result) => {
            console.log('Result from unban node:', result);
        });
    }

    removeBans() {
        this.apiService.removeBans().subscribe((result) => {
            console.log('Result from remove bans:', result);
        });
    }

    back() {
        this.router.navigateByUrl('/network');
    }
}
