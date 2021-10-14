/* eslint-disable */

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
import { WalletSplit } from '@models/wallet-split';
import { Logger } from 'src/app/services/logger.service';

@Component({
    selector: 'app-staking',
    templateUrl: './staking.component.html',
    styleUrls: ['./staking.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class StakingComponent implements OnInit, OnDestroy {
    @HostBinding('class.wallet') hostClass = true;

    public stakingForm: FormGroup;
    public delegatedForm: FormGroup;
    public coldStakingForm: FormGroup;

    public walletInfo = 'When you send, balance can\ntemporarily go from confirmed\nto unconfirmed.';
    public displayedColumns: string[] = ['transactionType', 'transactionAmount', 'transactionTimestamp'];
    public dataSource = new MatTableDataSource<TransactionInfo>();
    private walletServiceSubscription: Subscription;
    private coldStakingSubscription: Subscription;

    public firstTransactionDate: Date;
    public countReceived: number;
    public countSent: number;
    public walletStatistics: any;
    public coldStakingInfo: { coldWalletAccountExists: boolean, hotWalletAccountExists: boolean }

    public delegatedStakingAddress = '';
    public coldStakingAddress = '';

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
        private log: Logger,
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

        this.delegatedForm = this.fb.group({
            walletPassword: ['', Validators.required]
        });

        this.coldStakingForm = this.fb.group({
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

        this.coldStakingSubscription = this.apiService.getColdStakingInfo(this.globalService.getWalletName()).subscribe(data => {
            console.log('Cold Staking Info: ', data);
            this.coldStakingInfo = data;

            if (this.coldStakingInfo && this.coldStakingInfo.coldWalletAccountExists || this.coldStakingInfo.hotWalletAccountExists) {
                this.mode = 'enabled';
            }

            if (this.coldStakingInfo.coldWalletAccountExists) {
                this.apiService.getColdStakingAddress(this.globalService.getWalletName(), true, true).subscribe(data => {
                    console.log('Delegated Staking Address: ', data);
                    this.delegatedStakingAddress = data.address;
                });
            }

            if (this.coldStakingInfo.hotWalletAccountExists) {
                this.apiService.getColdStakingAddress(this.globalService.getWalletName(), false, true).subscribe(data => {
                    console.log('Cold Staking Address: ', data);
                    this.coldStakingAddress = data.address;
                });
            }

        });

        // We probably need to figure out what flag to look for to see if segwit is required. We can't allow user to select this.
        // (this.appState.addressType === 'Segwit')
    }

    ngOnDestroy() {
        if (this.walletServiceSubscription) {
            this.walletServiceSubscription.unsubscribe();
        }

        if (this.coldStakingSubscription) {
            this.coldStakingSubscription.unsubscribe();
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

    mode = '';

    setMode(mode: string) {
        this.mode = mode;

        if (!this.mode) {
            this.stakingForm.reset();
            this.coldStakingForm.reset();
            this.delegatedForm.reset();
        }
    }

    enableDelegatedStaking() {
        this.apiService.enableColdStaking(this.globalService.getWalletName(), this.delegatedForm.get('walletPassword').value, true).subscribe(
            response => {
                this.log.info('delegated staking enabled:', response);
            },
            error => {

                this.apiService.handleException(error);
            });

        this.delegatedForm.patchValue({ walletPassword: '' });
    }

    enableColdStaking() {
        this.apiService.enableColdStaking(this.globalService.getWalletName(), this.coldStakingForm.get('walletPassword').value, false).subscribe(
            response => {
                this.log.info('cold staking enabled:', response);
            },
            error => {

                this.apiService.handleException(error);
            });

        this.coldStakingForm.patchValue({ walletPassword: '' });
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
