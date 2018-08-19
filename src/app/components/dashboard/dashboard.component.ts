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


export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
    { position: 10, name: 'Jul 13, 2018, 1:15:40 AM', weight: 20.1797, symbol: 'Ne' },
    { position: 9, name: 'Jul 13, 2018, 1:15:40 AM', weight: 18.9984, symbol: 'F' },
    { position: 8, name: 'Jul 13, 2018, 1:15:40 AM', weight: 15.9994, symbol: 'O' },
    { position: 7, name: 'Jul 13, 2018, 1:15:40 AM', weight: 14.0067, symbol: 'N' },
    { position: 6, name: 'Jul 13, 2018, 1:15:40 AM', weight: 12.0107, symbol: 'C' },
    { position: 5, name: 'Jul 13, 2018, 1:15:40 AM', weight: 10.811, symbol: 'B' },
    { position: 4, name: 'Jul 13, 2018, 1:15:40 AM', weight: 9.0122, symbol: 'Be' },
    { position: 3, name: 'Jul 13, 2018, 1:15:40 AM', weight: 6.941, symbol: 'Li' },
    { position: 2, name: 'Jul 13, 2018, 1:15:40 AM', weight: 4.0026, symbol: 'He' },
    { position: 1, name: 'Jul 13, 2018, 1:15:40 AM', weight: 1.0079, symbol: 'H' },
];

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
    @HostBinding('class.dashboard') hostClass = true;

    // public walletName: string;
    // public coinUnit: string;
    // public confirmedBalance: number;
    // public unconfirmedBalance: number;
    // public transactionArray: TransactionInfo[];
    // private stakingForm: FormGroup;
    // private walletBalanceSubscription: Subscription;
    // private walletHistorySubscription: Subscription;
    // private stakingInfoSubscription: Subscription;
    // public stakingEnabled: boolean;
    // public stakingActive: boolean;
    // public stakingWeight: number;
    // public netStakingWeight: number;
    // public expectedTime: number;
    // public dateTime: string;
    // public isStarting: boolean;
    // public isStopping: boolean;
    // public hasBalance = false;

    displayedColumns: string[] = ['position', 'name', 'weight'];
    dataSource = ELEMENT_DATA;

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
        //this.startSubscriptions();
        // this.walletName = this.globalService.getWalletName();
        // this.coinUnit = this.globalService.getCoinUnit();
    }

    ngOnDestroy() {
        // When navigate away from dashboard, we'll make the wallet update more slowly.
        this.wallet.active = false;
        //this.cancelSubscriptions();
    }



    // private cancelSubscriptions() {
    //     if (this.walletBalanceSubscription) {
    //         this.walletBalanceSubscription.unsubscribe();
    //     }

    //     if (this.walletHistorySubscription) {
    //         this.walletHistorySubscription.unsubscribe();
    //     }

    //     if (this.stakingInfoSubscription) {
    //         this.stakingInfoSubscription.unsubscribe();
    //     }
    // }

}
