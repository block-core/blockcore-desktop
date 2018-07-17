import { Component, ViewEncapsulation, ChangeDetectionStrategy, AfterContentInit, HostBinding, OnInit, ViewChild } from '@angular/core';
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
export class NetworkComponent implements OnInit, AfterContentInit {
    @HostBinding('class.network') hostClass = true;
    @ViewChild('grid') grid: MatGridList;

    public percentSyncedNumber = 0;
    public percentSynced: string;

    gridByBreakpoint = {
        xl: 8,
        lg: 6,
        md: 4,
        sm: 2,
        xs: 1
    };

    generalInfo: GeneralInfo;

    constructor(private globalService: GlobalService,
        private apiService: ApiService,
        private observableMedia: ObservableMedia) {

    }

    ngOnInit() {
        this.getGeneralWalletInfo();
    }

    ngAfterContentInit() {
        this.observableMedia.asObservable().subscribe((change: MediaChange) => {
            this.grid.cols = this.gridByBreakpoint[change.mqAlias];
        });
    }

    private getGeneralWalletInfo() {
        //let walletInfo = new WalletInfo(this.globalService.getWalletName());
        const walletInfo = new WalletInfo('test01');
        this.apiService.getGeneralInfoTyped(walletInfo)
            .subscribe(response => {
                this.generalInfo = response;

                console.log(this.generalInfo);

                // Uncomment to change the UI to simulate downloading state.
                //this.generalInfo.lastBlockSyncedHeight = 50;
                //this.generalInfo.isChainSynced = false;

                // Translate the epoch value to a proper JavaScript date.
                this.generalInfo.creationTime = new Date(response.creationTime * 1000);

                this.percentSyncedNumber = ((this.generalInfo.lastBlockSyncedHeight / this.generalInfo.chainTip) * 100);
                if (this.percentSyncedNumber.toFixed(0) === '100' && this.generalInfo.lastBlockSyncedHeight !== this.generalInfo.chainTip) {
                    this.percentSyncedNumber = 99;
                }

                this.percentSynced = this.percentSyncedNumber.toFixed(0) + '%';
            });
    }
}
