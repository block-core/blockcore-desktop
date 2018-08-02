import { Component, ViewEncapsulation, ChangeDetectionStrategy, AfterContentInit, HostBinding, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { WalletComponent } from '../wallet/wallet.component';
import { WalletInfo } from '../../classes/wallet-info';
import { filter } from 'rxjs/operators';
import { GeneralInfo } from '../../classes/general-info';
import { MatGridList } from '@angular/material';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';

@Component({
    selector: 'app-network',
    templateUrl: './network.component.html',
    styleUrls: ['./network.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NetworkComponent implements OnInit, OnDestroy, AfterContentInit {
    @HostBinding('class.network') hostClass = true;
    //@ViewChild('grid') grid: MatGridList;

    percentSyncedNumber = 0;
    percentSynced = '0%';
    generalInfo: GeneralInfo;
    columns = 4;

    gridByBreakpoint = {
        xl: 8,
        lg: 6,
        md: 4,
        sm: 2,
        xs: 1
    };

    private mediaObservable;
    private walletObservable;

    constructor(private globalService: GlobalService,
        private apiService: ApiService,
        private readonly cd: ChangeDetectorRef,
        private observableMedia: ObservableMedia) {

    }

    ngOnInit() {
        this.getGeneralWalletInfo();
    }

    ngAfterContentInit() {
        // There is a bug with this, does not always trigger when navigating back and forth, and resizing.
        // This means the number of grids sometimes defaults to 4, even though the screen is small.
        this.mediaObservable = this.observableMedia.asObservable().subscribe((change: MediaChange) => {
            this.columns = this.gridByBreakpoint[change.mqAlias];
        });
    }

    ngOnDestroy() {
        this.mediaObservable.unsubscribe();
        this.walletObservable.unsubscribe();
    }

    private getGeneralWalletInfo() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());

        this.walletObservable = this.apiService.getGeneralInfoTyped(walletInfo, 3000)
            .subscribe(response => {
                this.generalInfo = response;

                console.log(this.generalInfo);

                // Uncomment to change the UI to simulate downloading state.
                //this.generalInfo.lastBlockSyncedHeight = 50;
                //this.generalInfo.isChainSynced = false;

                // Translate the epoch value to a proper JavaScript date.
                this.generalInfo.creationTime = new Date(response.creationTime * 1000);

                if (this.generalInfo.lastBlockSyncedHeight) {
                    this.percentSyncedNumber = ((this.generalInfo.lastBlockSyncedHeight / this.generalInfo.chainTip) * 100);
                    if (this.percentSyncedNumber.toFixed(0) === '100' && this.generalInfo.lastBlockSyncedHeight !== this.generalInfo.chainTip) {
                        this.percentSyncedNumber = 99;
                    }

                    this.percentSynced = this.percentSyncedNumber.toFixed(0) + '%';
                }

                this.cd.markForCheck();
            });
    }
}
