import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TransactionInfo } from '../../classes/transaction-info';
import { Router } from '@angular/router';
import { WalletInfo } from '../../classes/wallet-info';
import { DetailsService } from '../../services/details.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { WalletService } from '../../services/wallet.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
    @HostBinding('class.dashboard') hostClass = true;

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
