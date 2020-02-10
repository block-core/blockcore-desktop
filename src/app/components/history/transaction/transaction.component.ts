import { Component, ViewEncapsulation, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { ApplicationStateService } from '../../../services/application-state.service';
import { DetailsService } from '../../../services/details.service';
import { ApiService } from '../../../services/api.service';
import { GlobalService } from '../../../services/global.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-history-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {
    @HostBinding('class.transaction') hostClass = true;

    copied = false;
    coinUnit: string;
    confirmations: number;
    transactionJson: string;
    transaction: any;

    private generalWalletInfoSubscription: Subscription;

    constructor(
        public appState: ApplicationStateService,
        public snackBar: MatSnackBar,
        private detailsService: DetailsService,
        private apiService: ApiService,
        private http: HttpClient,
        private route: ActivatedRoute,
        private globalService: GlobalService
    ) {
        this.appState.pageMode = true;
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.getTransaction(params.id);
        });

        this.coinUnit = this.globalService.getCoinUnit();
    }

    ngOnDestroy() {
        this.appState.pageMode = false;
    }

    public onCopiedClick() {
        this.snackBar.open('The transaction ID has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }

    private getTransaction(id: string) {
        const url = this.apiService.apiUrl + '/' + this.apiService.apiVersion + '/transactions/' + id;

        this.http
            .get(url)
            .pipe(map(data => data)).subscribe(
                item => {
                    this.transaction = item;
                    this.transactionJson = JSON.stringify(item);

                    let out = 0;

                    if (this.transaction.vout != null) {
                        this.transaction.vout.forEach(script => {

                            if (script.value) {
                                out += script.value;
                            }

                        });
                    }

                    this.transaction.output = out;
                }
            );
    }
}
