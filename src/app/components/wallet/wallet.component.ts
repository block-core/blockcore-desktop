import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { WalletService } from '../../services/wallet.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { DetailsService } from '../../services/details.service';
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { TransactionInfo } from '../../classes/transaction-info';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AppModes } from '../../shared/app-modes';
import { Subscription } from 'rxjs';
import { WalletInfo } from '@models/wallet-info';
import { WalletUtxoCountDialogComponent } from './wallet-utxo-count-dialog';
import { WalletSplit } from '@models/wallet-split';

@Component({
    selector: 'app-wallet',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WalletComponent implements OnInit, OnDestroy {
    @HostBinding('class.wallet') hostClass = true;

    public stakingForm: FormGroup;
    public walletInfo = 'When you send, balance can\ntemporarily go from confirmed\nto unconfirmed.';
    public displayedColumns: string[] = ['transactionType', 'transactionAmount', 'transactionTimestamp'];
    public dataSource = new MatTableDataSource<TransactionInfo>();
    private walletServiceSubscription: Subscription;

    public firstTransactionDate: Date;
    public countReceived: number;
    public countSent: number;
    public walletStatistics: any;

    links = [{ title: 'All', filter: '' }, { title: 'Received', filter: 'received' }, { title: 'Sent', filter: 'sent' }];
    activeLink = this.links[0];

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        private apiService: ApiService,
        private globalService: GlobalService,
        private router: Router,
        public appState: ApplicationStateService,
        private detailsService: DetailsService,
        public wallet: WalletService,
        public appModes: AppModes,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private ref: ChangeDetectorRef
    ) {
        this.buildStakingForm();
        this.appState.pageMode = false;
    }

    private buildStakingForm(): void {
        this.stakingForm = this.fb.group({
            walletPassword: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        // "Cannot read property 'length' of undefined" error when setting to empty value.
        if (this.wallet.transactionArray != null) {
            this.parseHistory(this.wallet.transactionArray);
            // this.dataSource.data = this.wallet.transactionArray;
        }

        // We will only retrieve UTXOs statistics if user has enable advanced mode.
        if (this.appModes.enabled('staking')) {
            const walletInfo = new WalletInfo(this.globalService.getWalletName());
            this.apiService.getWalletStatistics(walletInfo).subscribe(data => {
                console.log(data);
                this.walletStatistics = data;
                this.ref.detectChanges();
            });
        }

        this.walletServiceSubscription = this.wallet.history$.subscribe(items => {

            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;

            this.parseHistory(items as TransactionInfo[]);
            this.ref.detectChanges();

            // this.dataSource.paginator = this.paginator;
            // this.dataSource.sort = this.sort;
        });
    }

    ngOnDestroy() {
        if (this.walletServiceSubscription) {
            this.walletServiceSubscription.unsubscribe();
        }
    }

    openDialog(): void {
        const amountFormatted = this.globalService.transform(this.wallet.confirmedBalance);

        const dialogRef = this.dialog.open(WalletUtxoCountDialogComponent, {
            width: '350px',
            data: { count: 10, amount: amountFormatted, utxos: this.walletStatistics.totalUtxoCount }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('Change UTXO count to:', result);

            const wallet = new WalletSplit(this.globalService.getWalletName(), 'account 0', result.password, result.amount, result.count);
            this.apiService.splitCoins(wallet).subscribe(data => {
                console.log(data);
                this.ref.detectChanges();
            });

            // this.animal = result;
        });
    }

    selectRow(row) {
        console.log(row);
    }

    filterHistory(link) {
        this.activeLink = link;
        this.applyFilter(this.activeLink.filter);
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    parseHistory(items: TransactionInfo[]) {
        this.dataSource.data = items;

        if (items.length > 0) {
            const firstTransaction = items[items.length - 1];
            this.firstTransactionDate = new Date(firstTransaction.transactionTimestamp * 1000);

            this.countSent = items.filter(i => i.transactionType === 'sent').length;
            this.countReceived = items.filter(i => i.transactionType === 'received').length;

            this.links[0].title = 'All (' + items.length + ')';
            this.links[1].title = 'Received (' + this.countReceived + ')';
            this.links[2].title = 'Sent (' + this.countSent + ')';
        }
    }

    public stopStaking() {
        this.wallet.stopStaking();
    }

    public startStaking() {
        this.wallet.startStaking(this.stakingForm.get('walletPassword').value);
        this.stakingForm.patchValue({ walletPassword: '' });
    }

    public openTransactionDetails(transaction: TransactionInfo) {
        this.detailsService.show(transaction);
    }
}
