import { Component, ViewEncapsulation, HostBinding, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DetailsService } from '../../services/details.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { WalletService } from '../../services/wallet.service';
import { ObservableMedia } from '@angular/flex-layout';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
    @HostBinding('class.dashboard') hostClass = true;
    public walletInfo = 'When you send, balance can\ntemporarily go from confirmed\nto unconfirmed.';

    constructor(private apiService: ApiService,
        private globalService: GlobalService,
        private router: Router,
        public appState: ApplicationStateService,
        private detailsService: DetailsService,
        public wallet: WalletService,
        private fb: FormBuilder) {

        // Make sure we update wallet at higher frequency.
        this.wallet.active = true;
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        // When navigate away from dashboard, we'll make the wallet update more slowly.
        this.wallet.active = false;
    }
}
