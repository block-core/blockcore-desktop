import { Component, ViewEncapsulation, ChangeDetectionStrategy, AfterContentInit, HostBinding, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { WalletComponent } from '../wallet/wallet.component';
import { WalletInfo } from '../../classes/wallet-info';
import { filter } from 'rxjs/operators';
import { GeneralInfo } from '../../classes/general-info';
import { MatGridList } from '@angular/material';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { WalletService } from '../../services/wallet.service';

@Component({
    selector: 'app-network',
    templateUrl: './network.component.html',
    styleUrls: ['./network.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NetworkComponent implements OnInit, OnDestroy, AfterContentInit {
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

    constructor(private globalService: GlobalService,
        private apiService: ApiService,
        private readonly cd: ChangeDetectorRef,
        private observableMedia: ObservableMedia,
        public walletService: WalletService) {

    }

    ngOnInit() {
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
    }
}
