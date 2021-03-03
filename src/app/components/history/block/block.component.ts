/* eslint-disable */

import { Component, ViewEncapsulation, HostBinding, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { throwError } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ApplicationStateService } from '../../../services/application-state.service';
import { DetailsService } from '../../../services/details.service';
import { ApiService } from '../../../services/api.service';
import { GlobalService } from '../../../services/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PAGE_DOWN, PAGE_UP, HOME, END } from '@angular/cdk/keycodes';
import { WalletInfo } from '../../../classes/wallet-info';
import { Logger } from '../../../services/logger.service';
import { HttpClient } from '@angular/common/http';

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
        // eslint-disable-next-line import/no-deprecated
        if (event.keyCode === PAGE_UP) {
            this.increment();
        }

        // eslint-disable-next-line import/no-deprecated
        if (event.keyCode === PAGE_DOWN) {
            this.decrement();
        }

        // eslint-disable-next-line import/no-deprecated
        if (event.keyCode === END) {
            this.openLatest();
        }

        // eslint-disable-next-line import/no-deprecated
        if (event.keyCode === HOME) {
            this.open(0);
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

    get isOnGenesisBlock(): boolean {
        return this.block.height === 0;
    }

    openLatest() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());
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
        if (!this.isOnGenesisBlock) {
            this.router.navigateByUrl('/history/block/' + (this.block.height - 1));
        }
    }

    ngOnInit() {
        this.getBlock();
        this.coinUnit = this.globalService.getCoinUnit();
        this.dataSource.paginator = this.paginator;
    }

    ngOnDestroy() {
        this.appState.pageMode = false;
    }

    public openTransactionDetails(transaction) {
        this.router.navigateByUrl('/history/transaction/' + transaction.txid);
    }

    getBlock() {
        this.route.params.subscribe(params => {

            const url = this.apiService.apiUrl + '/' + this.apiService.apiVersion + '/blocks/' + params.id;

            this.http
                .get<any[]>(url)
                .pipe(catchError(this.apiService.handleError.bind(this)))
                .pipe(map(data => data)).subscribe(
                    item => {
                        this.block = item;
                        this.blockJson = JSON.stringify(item);

                        this.log.info('BLOCK', item);

                        let inputs = 0;
                        let outputs = 0;

                        this.block.tx.forEach(tx => {

                            let out = 0;

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

                        this.dataSource.data = this.block.tx;
                    }
                );
        });
    }

    public onCopiedClick() {
        this.snackBar.open('The transaction ID has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }
}
