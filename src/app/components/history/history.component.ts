import { Component, ViewEncapsulation, HostBinding, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DetailsService } from '../../services/details.service';
import { ApiService } from '../../services/api.service';
import { GlobalService } from '../../services/global.service';
import { Subscription } from 'rxjs';
import { TransactionInfo } from '../../classes/transaction-info';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApplicationStateService } from '../../services/application-state.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
    public blocks: any = [];
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
        this.snackBar.open('The transaction ID has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }

    public openBlockDetails(block) {
        this.router.navigateByUrl('/block/' + block.hash);
    }

    public openTransactionDetails(transaction) {
        this.router.navigateByUrl('/history/transaction/' + transaction.txid);
    }

    private getLatestTransactions() {
        const url = this.apiService.apiUrl + '/' + this.apiService.apiVersion + '/transactions';

        this.http
            .get<any[]>(url)
            .pipe(map(data => data)).subscribe(
                items => {
                    // Calculate the in and out, this should in the future be added to the API perhaps to easier API consumption?
                    items.forEach(tx => {
                        let out = 0;

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
        const url = this.apiService.apiUrl + '/' + this.apiService.apiVersion + '/blocks';

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
