import { Component, ViewEncapsulation, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { DetailsService } from '../../services/details.service';
import { ApiService } from '../../services/api.service';
import { GlobalService } from '../../services/global.service';
import { TransactionInfo } from '../../classes/transaction-info';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationStateService } from '../../services/application-state.service';
import { WalletService } from '../../services/wallet.service';

// Until Angular supports improved named routing and lazy-loading, we'll have to use this details controller for all details pain.
@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DetailsComponent implements OnInit, OnDestroy {
    @HostBinding('class.details') hostClass = true;

    public copied = false;
    public coinUnit: string;

    constructor(
        public appState: ApplicationStateService,
        private detailsService: DetailsService,
        private apiService: ApiService,
        private walletService: WalletService,
        public snackBar: MatSnackBar,
        private globalService: GlobalService
    ) {

    }

    get transaction(): TransactionInfo {
        return this.detailsService.item;
    }

    get confirmations(): number {
        if (this.transaction) {
            if (this.transaction.transactionConfirmedInBlock) {
                return this.walletService.lastBlockSyncedHeight - Number(this.transaction.transactionConfirmedInBlock) + 1;
            } else {
                return 0;
            }
        }

        return 0;
    }

    ngOnInit() {
        this.coinUnit = this.globalService.getCoinUnit();
    }

    ngOnDestroy() {
    }

    public onCopiedClick() {
        this.snackBar.open('The transaction ID has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }
}
