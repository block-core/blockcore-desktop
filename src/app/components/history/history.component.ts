import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { DetailsService } from '../../services/details.service';
import { ApiService } from '../../services/api.service';
import { GlobalService } from '../../services/global.service';
import { Subscription } from 'rxjs';
import { TransactionInfo } from '../../classes/transaction-info';
import { WalletInfo } from '../../classes/wallet-info';
import { MatSnackBar, MatTableDataSource, MatPaginator } from '@angular/material';
import { ApplicationStateService } from '../../services/application-state.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HistoryComponent implements OnInit, OnDestroy {
    @HostBinding('class.history') hostClass = true;

    public loading = false;
    public searchInput = '';
    public copied = false;
    public coinUnit: string;
    public confirmations: number;

    private generalWalletInfoSubscription: Subscription;
    private lastBlockSyncedHeight: number;
    private blocks: any = [];
    private transactions: any = [];

    displayedColumns: string[] = ['height', 'hash', 'time', 'transactions'];
    public dataSource = new MatTableDataSource<any>();
    @ViewChild(MatPaginator) paginator: MatPaginator;

    displayedColumnsTransactions: string[] = ['txid', 'output', 'outputs', 'inputs', 'size'];
    public dataSourceTransactions = new MatTableDataSource<any>();
    @ViewChild(MatPaginator) paginatorTransactions: MatPaginator;

    constructor(
        private http: HttpClient,
        public appState: ApplicationStateService,
        private detailsService: DetailsService,
        private apiService: ApiService,
        private router: Router,
        public snackBar: MatSnackBar,
        private globalService: GlobalService
    ) {
        this.appState.pageMode = false;
    }

    get transaction(): TransactionInfo {
        return this.detailsService.item;
    }

    ngOnInit() {
        this.coinUnit = this.globalService.getCoinUnit();
        this.dataSource.paginator = this.paginator;
        this.refresh();
    }

    refresh() {
        this.getLatestBlocks();
        this.getLatestTransactions();
    }

    search() {
        this.router.navigateByUrl('/history/block/' + this.searchInput);
    }

    ngOnDestroy() {
       
    }

    public onCopiedClick() {
        let snackBarRef = this.snackBar.open('The transaction ID has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }
    
    private getLatestTransactions() {
        var url = 'http://localhost:24335/api/transactions?api-version=2.0';

        this.http
        .get<any[]>(url)
        .pipe(map(data => data)).subscribe(
            items => {
                // Calculate the in and out, this should in the future be added to the API perhaps to easier API consumption?
                items.forEach(tx => {
                    var out = 0;

                    tx.vout.forEach(script => {

                        if (script.value) {
                            out += script.value;
                        }

                    });

                    tx.output = out;

                });

                this.transactions = items;
                this.dataSourceTransactions.data = items;
            }
        );
    }

    private getLatestBlocks() {
        var url = 'http://localhost:24335/api/blocks?api-version=2.0';

        this.loading = true;

        this.http
            .get<any[]>(url)
            .pipe(map(data => data)).subscribe(
                items => {
                    this.blocks = items;
                    this.dataSource.data = items;
                    this.loading = false;
                }
            );
    }
}
