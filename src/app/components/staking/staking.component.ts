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
import { Logger } from 'src/app/services/logger.service';
import { TransactionSending } from '@models/transaction-sending';

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
    public offlineForm: FormGroup;
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
        private walletService: WalletService,
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

        this.offlineForm = this.fb.group({
            walletPassword: ['', Validators.required],
            onlineColdStakingAddress: ['', Validators.required],
            amount: ['', Validators.required],
            fee: ['0.002', Validators.required]
        });

        this.coldStakingForm = this.fb.group({
            walletPassword: ['', Validators.required]
        });
    }

    localOnlineColdStakingAccounts = [];
    selectedAccount: any;
    selectedAddress: string;

    onAccountChanged(event) {
        this.offlineForm.controls['onlineColdStakingAddress'].setValue(event.value);
    }

    getMaxAmount() {
        var balance = this.globalService.transform(this.wallet.confirmedBalance);
        this.offlineForm.controls["amount"].setValue(balance);
    }

    public confirmedBalance: number;
    public unconfirmedBalance: number;
    public hasHotColdStakingBalance = false;
    public coldStakingHistory: any;

    public confirmedOfflineBalance: number;
    public unconfirmedOfflineBalance: number;
    public hasOfflineColdStakingBalance = false;
    public coldStakingOfflineHistory: any;

    // TODO: All of this code is a flying spaghetti monster mess!
    // A proper manager to get state in correct order, etc. must be made, so do some refactoring later!
    ngOnInit() {
        this.localOnlineColdStakingAccounts = [];

        // Discover all online cold staking wallets:
        this.appState.accounts.forEach((account) => {

            // 
            this.apiService.getColdStakingAddress(account.name, false, true).subscribe((address) => {
                this.localOnlineColdStakingAccounts.push({ name: account.name, address: address.address });
                console.log(this.localOnlineColdStakingAccounts);
            });

        });

        const walletInfo = new WalletInfo(this.globalService.getWalletName(), 'coldStakingHotAddresses');
        const walletInfoOffline = new WalletInfo(this.globalService.getWalletName(), 'coldStakingColdAddresses');

        this.apiService.getWalletHistory(walletInfo).subscribe(response => {
            console.log(response);
            this.coldStakingHistory = response.history[0].transactionsHistory;
        }, error => {
            console.error(error);
            this.apiService.handleError(error);
        });

        this.apiService.getWalletBalance(walletInfo).subscribe(response => {
            this.log.info('Get hot cold staking wallet balance:', response);

            const balanceResponse = response;
            this.confirmedBalance = balanceResponse.balances[0].amountConfirmed;
            this.unconfirmedBalance = balanceResponse.balances[0].amountUnconfirmed;

            if ((this.confirmedBalance + this.unconfirmedBalance) > 0) {
                this.hasHotColdStakingBalance = true;
            } else {
                this.hasHotColdStakingBalance = false;
            }
        },
            error => {
                this.apiService.handleException(error);
            });


        this.apiService.getWalletHistory(walletInfoOffline).subscribe(response => {
            console.log(response);
            this.coldStakingOfflineHistory = response.history[0].transactionsHistory;
        }, error => {
            console.error(error);
            this.apiService.handleError(error);
        });

        this.apiService.getWalletBalance(walletInfoOffline).subscribe(response => {
            this.log.info('Get offline cold staking wallet balance:', response);

            const balanceResponse = response;
            this.confirmedOfflineBalance = balanceResponse.balances[0].amountConfirmed;
            this.unconfirmedOfflineBalance = balanceResponse.balances[0].amountUnconfirmed;

            if ((this.confirmedOfflineBalance + this.unconfirmedOfflineBalance) > 0) {
                this.hasOfflineColdStakingBalance = true;
            } else {
                this.hasOfflineColdStakingBalance = false;
            }
        },
            error => {
                this.apiService.handleException(error);
            });


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
            this.offlineForm.reset();
            this.delegatedForm.reset();
        }
    }

    invalidPassword: boolean;

    setupStaking() {
        this.invalidPassword = false;

        let amount = +this.offlineForm.get('amount').value;
        const confirmedBalance = +this.globalService.transform(this.wallet.confirmedBalance);
        const fee = +this.offlineForm.get('fee').value;

        // Basic protection against mistakes.
        if (fee > amount) {
            throw Error('You cannot have a fee that is larger than the amount.');
        }

        // If the amount and fee is larger than balance, remove fee from amount.
        if ((amount + fee) > confirmedBalance) {
            amount = amount - fee;
        }

        this.apiService.setupOfflineColdStaking(
            this.globalService.getWalletName(),
            this.offlineForm.get('walletPassword').value,
            'account 0',
            this.delegatedStakingAddress,
            this.offlineForm.get('onlineColdStakingAddress').value,
            amount,
            fee,
            true, // segwit change address
            true // paytoscript
        ).subscribe(
            response => {
                this.log.info('offline cold staking transaction hex:', response.transactionHex);

                // Broadcast transaction:
                this.apiService.sendTransaction(new TransactionSending(response.transactionHex)).subscribe(
                    response => {
                        this.log.info('Transaction broadcasted successfully and cold staking activated!', response);
                    },
                    error => {
                        console.error(error);
                        this.apiService.handleException(error);

                    });
            },
            error => {
                if (error.error.errors[0]?.message.indexOf('Invalid password') > -1) {
                    this.invalidPassword = true;
                }

                this.apiService.handleException(error);
            });
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
