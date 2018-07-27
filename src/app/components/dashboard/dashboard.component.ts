import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TransactionInfo } from '../../classes/transaction-info';
import { Router } from '@angular/router';
import { WalletInfo } from '../../classes/wallet-info';
import { DetailsService } from '../../services/details.service';


export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
    { position: 10, name: 'Jul 13, 2018, 1:15:40 AM', weight: 20.1797, symbol: 'Ne' },
    { position: 9, name: 'Jul 13, 2018, 1:15:40 AM', weight: 18.9984, symbol: 'F' },
    { position: 8, name: 'Jul 13, 2018, 1:15:40 AM', weight: 15.9994, symbol: 'O' },
    { position: 7, name: 'Jul 13, 2018, 1:15:40 AM', weight: 14.0067, symbol: 'N' },
    { position: 6, name: 'Jul 13, 2018, 1:15:40 AM', weight: 12.0107, symbol: 'C' },
    { position: 5, name: 'Jul 13, 2018, 1:15:40 AM', weight: 10.811, symbol: 'B' },
    { position: 4, name: 'Jul 13, 2018, 1:15:40 AM', weight: 9.0122, symbol: 'Be' },
    { position: 3, name: 'Jul 13, 2018, 1:15:40 AM', weight: 6.941, symbol: 'Li' },
    { position: 2, name: 'Jul 13, 2018, 1:15:40 AM', weight: 4.0026, symbol: 'He' },
    { position: 1, name: 'Jul 13, 2018, 1:15:40 AM', weight: 1.0079, symbol: 'H' },
];

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
    @HostBinding('class.dashboard') hostClass = true;

    public walletName: string;
    public coinUnit: string;
    public confirmedBalance: number;
    public unconfirmedBalance: number;
    public transactionArray: TransactionInfo[];
    private stakingForm: FormGroup;
    private walletBalanceSubscription: Subscription;
    private walletHistorySubscription: Subscription;
    private stakingInfoSubscription: Subscription;
    public stakingEnabled: boolean;
    public stakingActive: boolean;
    public stakingWeight: number;
    public netStakingWeight: number;
    public expectedTime: number;
    public dateTime: string;
    public isStarting: boolean;
    public isStopping: boolean;
    public hasBalance = false;

    displayedColumns: string[] = ['position', 'name', 'weight'];
    dataSource = ELEMENT_DATA;

    constructor(private apiService: ApiService,
        private globalService: GlobalService,
        private router: Router,
        private detailsService: DetailsService,
        private fb: FormBuilder) {
        this.buildStakingForm();
    }

    ngOnInit() {
        this.startSubscriptions();
        this.walletName = this.globalService.getWalletName();
        this.coinUnit = this.globalService.getCoinUnit();
    }

    ngOnDestroy() {
        this.cancelSubscriptions();
    }

    private buildStakingForm(): void {
        this.stakingForm = this.fb.group({
            "walletPassword": ["", Validators.required]
        });
    }

    public openTransactionDetails(transaction: TransactionInfo) {

        this.detailsService.show(transaction);

        //const modalRef = this.modalService.open(TransactionDetailsComponent, { backdrop: "static", keyboard: false });
        //modalRef.componentInstance.transaction = transaction;
    }

    private cancelSubscriptions() {
        if (this.walletBalanceSubscription) {
            this.walletBalanceSubscription.unsubscribe();
        }

        if (this.walletHistorySubscription) {
            this.walletHistorySubscription.unsubscribe();
        }

        if (this.stakingInfoSubscription) {
            this.stakingInfoSubscription.unsubscribe();
        }
    }

    private startSubscriptions() {
        this.getWalletBalance();
        this.getHistory();
        this.getStakingInfo();
    }

    private getWalletBalance() {
        let walletInfo = new WalletInfo(this.globalService.getWalletName());
        this.walletBalanceSubscription = this.apiService.getWalletBalance(walletInfo)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        let balanceResponse = response.json();
                        //TO DO - add account feature instead of using first entry in array
                        this.confirmedBalance = balanceResponse.balances[0].amountConfirmed;
                        this.unconfirmedBalance = balanceResponse.balances[0].amountUnconfirmed;
                        if ((this.confirmedBalance + this.unconfirmedBalance) > 0) {
                            this.hasBalance = true;
                        } else {
                            this.hasBalance = false;
                        }
                    }
                },
                error => {
                    console.log(error);
                    if (error.status === 0) {
                        this.cancelSubscriptions();
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
            )
            ;
    };

    // todo: add history in seperate service to make it reusable
    private getHistory() {
        let walletInfo = new WalletInfo(this.globalService.getWalletName());
        let historyResponse;
        this.walletHistorySubscription = this.apiService.getWalletHistory(walletInfo)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        //TO DO - add account feature instead of using first entry in array
                        if (!!response.json().history && response.json().history[0].transactionsHistory.length > 0) {
                            historyResponse = response.json().history[0].transactionsHistory;
                            this.getTransactionInfo(historyResponse);
                        }
                    }
                },
                error => {
                    console.log(error);
                    if (error.status === 0) {
                        this.cancelSubscriptions();
                        // this.genericModalService.openModal(null, null);
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        }
                        else {
                            if (error.json().errors[0].description) {
                                // this.genericModalService.openModal(null, error.json().errors[0].message);
                            } else {
                                this.cancelSubscriptions();
                                this.startSubscriptions();
                            }
                        }
                    }
                }
            )
            ;
    };

    private getTransactionInfo(transactions: any) {
        this.transactionArray = [];

        for (let transaction of transactions) {
            let transactionType;
            if (transaction.type === "send") {
                transactionType = "sent";
            } else if (transaction.type === "received") {
                transactionType = "received";
            } else if (transaction.type === "staked") {
                transactionType = "staked";
            }
            let transactionId = transaction.id;
            let transactionAmount = transaction.amount;
            let transactionFee;
            if (transaction.fee) {
                transactionFee = transaction.fee;
            } else {
                transactionFee = 0;
            }
            let transactionConfirmedInBlock = transaction.confirmedInBlock;
            let transactionTimestamp = transaction.timestamp;
            let transactionConfirmed;

            this.transactionArray.push(new TransactionInfo(transactionType, transactionId, transactionAmount, transactionFee, transactionConfirmedInBlock, transactionTimestamp));
        }
    }

    private startStaking() {
        this.isStarting = true;
        this.isStopping = false;
        let walletData = {
            name: this.globalService.getWalletName(),
            password: this.stakingForm.get('walletPassword').value
        }
        this.apiService.startStaking(walletData)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        this.stakingEnabled = true;
                        this.stakingForm.patchValue({ walletPassword: "" });
                    }
                },
                error => {
                    this.isStarting = false;
                    this.stakingEnabled = false;
                    this.stakingForm.patchValue({ walletPassword: "" });
                    if (error.status === 0) {
                        // this.genericModalService.openModal(null, null);
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        } else {
                            // this.genericModalService.openModal(null, error.json().errors[0].message);
                        }
                    }
                }
            )
            ;
    }

    private stopStaking() {
        this.isStopping = true;
        this.isStarting = false;
        this.apiService.stopStaking()
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        this.stakingEnabled = false;
                    }
                },
                error => {
                    if (error.status === 0) {
                        // this.genericModalService.openModal(null, null);
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        } else {
                            // this.genericModalService.openModal(null, error.json().errors[0].message);
                        }
                    }
                }
            )
            ;
    }

    private getStakingInfo() {
        this.stakingInfoSubscription = this.apiService.getStakingInfo()
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        const stakingResponse = response.json();
                        this.stakingEnabled = stakingResponse.enabled;
                        this.stakingActive = stakingResponse.staking;
                        this.stakingWeight = stakingResponse.weight;
                        this.netStakingWeight = stakingResponse.netStakeWeight;
                        this.expectedTime = stakingResponse.expectedTime;
                        this.dateTime = this.secondsToString(this.expectedTime);
                        if (this.stakingActive) {
                            this.isStarting = false;
                        } else {
                            this.isStopping = false;
                        }
                    }
                },
                error => {
                    if (error.status === 0) {
                        // this.genericModalService.openModal(null, null);
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        } else {
                            // this.genericModalService.openModal(null, error.json().errors[0].message);
                        }
                    }
                }
            )
            ;
    }

    private secondsToString(seconds: number) {
        let numDays = Math.floor(seconds / 86400);
        let numHours = Math.floor((seconds % 86400) / 3600);
        let numMinutes = Math.floor(((seconds % 86400) % 3600) / 60);
        let numSeconds = ((seconds % 86400) % 3600) % 60;
        let dateString = "";

        if (numDays > 0) {
            if (numDays > 1) {
                dateString += numDays + " days ";
            } else {
                dateString += numDays + " day ";
            }
        }

        if (numHours > 0) {
            if (numHours > 1) {
                dateString += numHours + " hours ";
            } else {
                dateString += numHours + " hour ";
            }
        }

        if (numMinutes > 0) {
            if (numMinutes > 1) {
                dateString += numMinutes + " minutes ";
            } else {
                dateString += numMinutes + " minute ";
            }
        }

        if (dateString === "") {
            dateString = "Unknown";
        }

        return dateString;
    }
}
