import { Component, ViewEncapsulation, HostBinding, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DetailsService } from '../../services/details.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { WalletService } from '../../services/wallet.service';
import { ObservableMedia } from '@angular/flex-layout';
import { CoincapService } from 'src/app/services/coincap.service';
import { Subscription } from 'rxjs';
import { CoincapAsset } from 'src/app/classes/coincap-asset';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
    @HostBinding('class.dashboard') hostClass = true;
    public walletInfo = 'When you send, balance can\ntemporarily go from confirmed\nto unconfirmed.';
    public coincapAsset: CoincapAsset;
    private coincapSubscription: Subscription;

    constructor(private apiService: ApiService,
        private coincap: CoincapService,
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
        this.startSubscriptions();
    }

    private startSubscriptions() {
        let asset = this.appState.chain;

        if (asset === 'city') {
            asset = 'bitcoin'; // Until coincap.io supports CITY, we'll revert to Bitcoin.
        }

        this.coincapSubscription = this.coincap.getAsset(asset)
            .subscribe(
                response => {
                    this.coincapAsset = response.data as CoincapAsset;
                },
                error => {
                    this.coincap.handleException(error);
                    this.reactivate();
                }
            );
    }

    private cancelSubscriptions() {
        if (this.coincapSubscription) {
            this.coincapSubscription.unsubscribe();
        }
    }

    /** Called to cancel and restart all subscriptions. */
    private reactivate() {
        this.cancelSubscriptions();
        this.startSubscriptions();
    }

    ngOnDestroy() {
        // When navigate away from dashboard, we'll make the wallet update more slowly.
        this.wallet.active = false;
        this.cancelSubscriptions();
    }
}
