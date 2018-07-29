import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable, interval, Subscription } from 'rxjs';
import { map, withLatestFrom, startWith, switchMap, } from 'rxjs/operators';
import { GlobalService } from './global.service';
import { ElectronService } from 'ngx-electron';
import { WalletCreation } from '../classes/wallet-creation';
import { WalletRecovery } from '../classes/wallet-recovery';
import { WalletLoad } from '../classes/wallet-load';
import { WalletInfo } from '../classes/wallet-info';
import { Mnemonic } from '../classes/mnemonic';
import { FeeEstimation } from '../classes/fee-estimation';
import { TransactionBuilding } from '../classes/transaction-building';
import { TransactionSending } from '../classes/transaction-sending';
import { GeneralInfo } from '../classes/general-info';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TransactionInfo } from '../classes/transaction-info';
import { DetailsService } from './details.service';
import { ApplicationStateService } from './application-state.service';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable()
export class WalletService {

    /** Set to true to make the wallet update wallet status at higher frequency. Set to false when high refresh rate is not needed. */
    public active = false;

    public walletName: string;
    public coinUnit: string;
    public confirmedBalance: number;
    public unconfirmedBalance: number;
    public transactionArray: TransactionInfo[];
    //private stakingForm: FormGroup;
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

    constructor(private apiService: ApiService,
        private globalService: GlobalService,
        private router: Router,
        public appState: ApplicationStateService,
        private detailsService: DetailsService,
        private fb: FormBuilder) {

    }

    public start() {
        this.walletName = this.globalService.getWalletName();
        this.coinUnit = this.globalService.getCoinUnit();
        this.startSubscriptions();
    }

    public stop() {
        this.walletName = '';
        this.coinUnit = '';
        this.confirmedBalance = null;
        this.unconfirmedBalance = null;
        this.active = false;
        this.transactionArray = [];
        this.cancelSubscriptions();
    }

    private cancelSubscriptions() {
        this.walletBalanceSubscription.unsubscribe();
        this.walletHistorySubscription.unsubscribe();
        this.stakingInfoSubscription.unsubscribe();
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
                        // this.cancelSubscriptions();
                        // this.genericModalService.openModal(null, null);
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        } else {
                            if (error.json().errors[0].description) {
                                // this.genericModalService.openModal(null, error.json().errors[0].message);
                            } else {
                                // this.cancelSubscriptions();
                                // this.startSubscriptions();
                            }
                        }
                    }
                }
            );
    }

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
                        // this.cancelSubscriptions();
                        // this.genericModalService.openModal(null, null);
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        } else {
                            if (error.json().errors[0].description) {
                                // this.genericModalService.openModal(null, error.json().errors[0].message);
                            } else {
                                // this.cancelSubscriptions();
                                // this.startSubscriptions();
                            }
                        }
                    }
                }
            );
    }

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

    public startStaking(password: string) {
        this.isStarting = true;
        this.isStopping = false;

        const walletData = {
            name: this.globalService.getWalletName(),
            password: password
        };

        this.apiService.startStaking(walletData)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        this.stakingEnabled = true;
                    }
                },
                error => {
                    this.isStarting = false;
                    this.stakingEnabled = false;

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
            );
    }

    public stopStaking() {
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
            );
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
