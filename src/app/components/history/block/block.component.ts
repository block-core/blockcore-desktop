import { Component, ViewEncapsulation, HostBinding, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Subscription, throwError } from 'rxjs';
import { MatSnackBar, MatTableDataSource, MatPaginator } from '@angular/material';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ApplicationStateService } from '../../../services/application-state.service';
import { DetailsService } from '../../../services/details.service';
import { ApiService } from '../../../services/api.service';
import { GlobalService } from '../../../services/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PAGE_DOWN, PAGE_UP, HOME, END } from '@angular/cdk/keycodes';
import { WalletInfo } from '../../../classes/wallet-info';
import { Logger } from '../../../services/logger.service';

@Component({
    selector: 'app-history-block',
    templateUrl: './block.component.html',
    styleUrls: ['./block.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class BlockHistoryComponent implements OnInit, OnDestroy {
    @HostBinding('class.block') hostClass = true;

    copied = false;
    coinUnit: string;
    confirmations: number;
    block: any;
    blockJson: string;
    displayedColumns: string[] = ['txid', 'output', 'inputs', 'outputs', 'size'];
    dataSource = new MatTableDataSource<any>();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent) {
        if (event.keyCode === PAGE_UP) {
            this.increment();
        }

        if (event.keyCode === PAGE_DOWN) {
            this.decrement();
        }

        if (event.keyCode === END) {
            this.openLatest();
        }

        if (event.keyCode === HOME) {
            this.open(1);
        }
    }

    constructor(
        private http: HttpClient,
        public appState: ApplicationStateService,
        private detailsService: DetailsService,
        private log: Logger,
        private apiService: ApiService,
        public snackBar: MatSnackBar,
        private route: ActivatedRoute,
        private router: Router,
        private globalService: GlobalService
    ) {
        this.appState.pageMode = true;
    }

    openLatest() {
        let walletInfo = new WalletInfo(this.globalService.getWalletName());
        this.apiService.getGeneralInfoOnceTyped(walletInfo).subscribe(info => {
            this.open(info.lastBlockSyncedHeight);
        });
    }

    open(height: number) {
        this.router.navigateByUrl('/history/block/' + height);
    }

    increment() {
        this.router.navigateByUrl('/history/block/' + (this.block.height + 1));
    }

    decrement() {
        this.router.navigateByUrl('/history/block/' + (this.block.height - 1));
    }

    private handleError(error: HttpErrorResponse | any) {
        if (!this.log) {
            console.error(error);
            return throwError('Something bad happened; please try again later.');
        }

        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            this.log.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            this.log.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.errors}`);
        }
        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
    };

    ngOnInit() {
        this.getBlock();
        this.coinUnit = this.globalService.getCoinUnit();
        this.dataSource.paginator = this.paginator;
    }

    ngOnDestroy() {
        this.appState.pageMode = false;
    }

    getBlock() {
        this.route.params.subscribe(params => {

            var url = this.apiService.apiUrl + '/blocks/' + params.id + '?api-version=2.0';

            this.http
                .get<any[]>(url)
                .pipe(catchError(this.handleError))
                .pipe(map(data => data)).subscribe(
                    item => {
                        this.block = item;
                        this.blockJson = JSON.stringify(item);

                        this.log.info('BLOCK', item);

                        var inputs = 0;
                        var outputs = 0;

                        this.block.transactions.forEach(tx => {

                            var out = 0;

                            if (tx.vout != null) {
                                outputs += tx.vout.length;
                            }

                            if (tx.vin != null) {
                                inputs += tx.vin.length;
                            }

                            tx.vout.forEach(script => {

                                if (script.value) {
                                    out += script.value;
                                }

                            });

                            tx.output = out;

                        });

                        this.block.inputs = inputs;
                        this.block.outputs = outputs;

                        this.dataSource.data = this.block.transactions;
                    }
                );
        });
    }

    public onCopiedClick() {
        let snackBarRef = this.snackBar.open('The transaction ID has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }
}
