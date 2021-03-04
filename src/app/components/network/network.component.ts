import { Component, ViewEncapsulation, ChangeDetectionStrategy, AfterContentInit, HostBinding, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { WalletService } from '../../services/wallet.service';
import { Router } from '@angular/router';

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

    constructor(
        private globalService: GlobalService,
        private apiService: ApiService,
        private readonly cd: ChangeDetectorRef,
        public mediaObserver: MediaObserver,
        public router: Router,
        public walletService: WalletService) {

    }

    ngOnInit() {
    }

    ngAfterContentInit() {
        // There is a bug with this, does not always trigger when navigating back and forth, and resizing.
        // This means the number of grids sometimes defaults to 4, even though the screen is small.
        this.mediaObservable = this.mediaObserver.media$.subscribe((change: MediaChange) => {
            this.columns = this.gridByBreakpoint[change.mqAlias];
        });
    }

    ngOnDestroy() {
        this.mediaObservable.unsubscribe();
    }

    details() {
        this.router.navigateByUrl('/network/details');
    }
}
