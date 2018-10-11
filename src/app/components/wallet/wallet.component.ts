import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { WalletService } from '../../services/wallet.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { DetailsService } from '../../services/details.service';
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { TransactionInfo } from '../../classes/transaction-info';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { AppModes } from '../../shared/app-modes';
import { Subscription } from 'rxjs';

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
    public displayedColumns: string[] = ['transactionAmount', 'transactionTimestamp'];
    public dataSource = new MatTableDataSource<TransactionInfo>();
    private walletServiceSubscription: Subscription;

    public firstTransactionDate: Date;
    public countReceived: number;
    public countSent: number;

    links = [{ title: 'All', filter: '' }, { title: 'Received', filter: 'received' }, { title: 'Sent', filter: 'sent' }];
    activeLink = this.links[0];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(
        private apiService: ApiService,
        private globalService: GlobalService,
        private router: Router,
        public appState: ApplicationStateService,
        private detailsService: DetailsService,
        public wallet: WalletService,
        public appModes: AppModes,
        private fb: FormBuilder,
        private ref: ChangeDetectorRef
    ) {
        this.buildStakingForm();
        this.appState.pageMode = false;
    }

    private buildStakingForm(): void {
        this.stakingForm = this.fb.group({
            'walletPassword': ['', Validators.required]
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

        this.walletServiceSubscription = this.wallet.history$.subscribe(items => {
            this.parseHistory(<TransactionInfo[]>items);
            this.ref.detectChanges();
        });
    }

    ngOnDestroy() {
        if (this.walletServiceSubscription) {
            this.walletServiceSubscription.unsubscribe();
        }
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
