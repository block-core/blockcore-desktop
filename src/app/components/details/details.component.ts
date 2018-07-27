import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy, Input } from '@angular/core';
import { DetailsService } from '../../services/details.service';
import { ApiService } from '../../services/api.service';
import { GlobalService } from '../../services/global.service';
import { Subscription } from 'rxjs';
import { TransactionInfo } from '../../classes/transaction-info';
import { WalletInfo } from '../../classes/wallet-info';
import { MatSnackBar } from '@angular/material';

// Until Angular supports improved named routing and lazy-loading, we'll have to use this details controller for all details pain.

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DetailsComponent implements OnInit, OnDestroy {
    @HostBinding('class.details') hostClass = true;

    // @Input() transaction: TransactionInfo;

    public copied = false;
    public coinUnit: string;
    public confirmations: number;
    private generalWalletInfoSubscription: Subscription;
    private lastBlockSyncedHeight: number;

    constructor(
        private detailsService: DetailsService,
        private apiService: ApiService,
        public snackBar: MatSnackBar,
        private globalService: GlobalService
    ) {

        // this.transaction = detailsService.item;
    }

    get transaction(): TransactionInfo {
        return this.detailsService.item;
    }

    ngOnInit() {
        this.startSubscriptions();
        this.coinUnit = this.globalService.getCoinUnit();
    }

    ngOnDestroy() {
        this.cancelSubscriptions();
    }

    public onCopiedClick() {
        let snackBarRef = this.snackBar.open('The transaction ID has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }

    private getGeneralWalletInfo() {
        let walletInfo = new WalletInfo(this.globalService.getWalletName());

        this.generalWalletInfoSubscription = this.apiService.getGeneralInfo(walletInfo)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        let generalWalletInfoResponse = response.json();
                        this.lastBlockSyncedHeight = generalWalletInfoResponse.lastBlockSyncedHeight;
                        this.getConfirmations(this.transaction);
                    }
                },
                error => {
                    console.log(error);
                    if (error.status === 0) {
                        // this.genericModalService.openModal(null, null);
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        } else {
                            if (error.json().errors[0].description) {
                                // this.genericModalService.openModal(null, error.json().errors[0].message);
                            } else {
                                this.cancelSubscriptions();
                                this.startSubscriptions();
                            }
                        }
                    }
                }
            );
    }

    private getConfirmations(transaction: TransactionInfo) {
        if (transaction.transactionConfirmedInBlock) {
            this.confirmations = this.lastBlockSyncedHeight - Number(transaction.transactionConfirmedInBlock) + 1;
        } else {
            this.confirmations = 0;
        }
    }

    private cancelSubscriptions() {
        if (this.generalWalletInfoSubscription) {
            this.generalWalletInfoSubscription.unsubscribe();
        }
    }

    private startSubscriptions() {
        this.getGeneralWalletInfo();
    }
}
