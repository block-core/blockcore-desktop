/* eslint-disable */

import { Injectable } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { GlobalService } from './global.service';
import { WalletInfo } from '../classes/wallet-info';
import { TransactionInfo } from '../classes/transaction-info';
import { ApplicationStateService } from './application-state.service';
import { ApiService } from './api.service';
import { GeneralInfo } from '../classes/general-info';
import { Logger } from './logger.service';
import { StakingInfo } from '../classes/staking-info';

@Injectable({
    providedIn: 'root'
})
export class WalletService {
    static singletonInstance: WalletService;

    private walletBalanceSubscription: Subscription;
    private walletHistorySubscription: Subscription;
    private stakingInfoSubscription: Subscription;
    private generalWalletInfoSubscription: Subscription;

    /** Set to true to make the wallet update wallet status at higher frequency. Set to false when high refresh rate is not needed. */
    public active = false;
    public walletName: string;
    public coinUnit: string;
    public confirmedBalance: number;
    public unconfirmedBalance: number;
    public transactionArray: TransactionInfo[];
    public stakingEnabled: boolean;
    public stakingActive: boolean;
    public stakingWeight: number;
    public lastBlockSyncedHeight: number;
    public netStakingWeight: number;
    public expectedTime: number;
    public dateTime: string;
    public isStarting: boolean;
    public isStopping: boolean;
    public hasBalance = false;
    public percentSyncedNumber = 0;
    public percentSynced = '0%';

    public generalInfo: GeneralInfo;
    public stakingInfo: StakingInfo;
    public activeWallet: any;

    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
    private _history = new Subject();
    public history$ = this._history.asObservable();

    constructor(
        private apiService: ApiService,
        private globalService: GlobalService,
        private log: Logger,
        public appState: ApplicationStateService
    ) {

        if (!WalletService.singletonInstance) {
            WalletService.singletonInstance = this;
        }

        return WalletService.singletonInstance;
    }

    get walletMode(): string {
        return localStorage.getItem('Settings:WalletMode') || 'multi';
    }

    get isMultiAddressMode(): boolean {
        return this.walletMode !== 'single';
    }

    get isSingleAddressMode(): boolean {
        return this.walletMode === 'single';
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

    public startStaking(password: string) {
        this.isStarting = true;
        this.isStopping = false;

        const walletData = {
            name: this.globalService.getWalletName(),
            password
        };

        this.apiService.startStaking(walletData)
            .subscribe(
                response => {
                    this.log.info('Start staking:', response);
                    this.stakingEnabled = true;
                    this.isStarting = false;
                },
                error => {
                    this.isStarting = false;
                    this.stakingEnabled = false;
                    this.apiService.handleException(error);
                }
            );
    }

    public stopStaking() {
        this.isStopping = true;
        this.isStarting = false;
        this.apiService.stopStaking()
            .subscribe(
                response => {
                    this.log.info('Stop staking:', response);
                    this.stakingEnabled = false;
                },
                error => {
                    this.apiService.handleException(error);
                }
            );
    }

    public resync() {
        this.apiService.removeHistory(this.globalService.getWalletName()).subscribe(() => {
            // Clear the transaction history so UI updates.
            this.transactionArray = [];
            this._history.next(this.transactionArray);
        }, error => {
            console.error(error);
        });
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

        if (this.generalWalletInfoSubscription) {
            this.generalWalletInfoSubscription.unsubscribe();
        }
    }

    private startSubscriptions() {
        this.getWalletBalance();
        this.getHistory();

        if (this.appState.activeChain.pos) {
            this.getStakingInfo();
        }

        this.getGeneralWalletInfo();
    }

    /** Called to cancel and restart all subscriptions. */
    private reactivate() {
        this.cancelSubscriptions();
        this.startSubscriptions();
    }

    private getWalletBalance() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());
        this.walletBalanceSubscription = this.apiService.getWalletBalance(walletInfo)
            .subscribe(
                response => {
                    this.log.info('Get wallet balance:', response);

                    const balanceResponse = response;
                    this.confirmedBalance = balanceResponse.balances[0].amountConfirmed;
                    this.unconfirmedBalance = balanceResponse.balances[0].amountUnconfirmed;

                    if ((this.confirmedBalance + this.unconfirmedBalance) > 0) {
                        this.hasBalance = true;
                    } else {
                        this.hasBalance = false;
                    }
                },
                error => {
                    this.apiService.handleException(error);
                    this.reactivate();
                }
            );
    }

    private getHistory() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());
        let historyResponse;
        this.walletHistorySubscription = this.apiService.getWalletHistory(walletInfo)
            .subscribe(
                response => {
                    if (!!response.history && response.history[0].transactionsHistory.length > 0) {
                        historyResponse = response.history[0].transactionsHistory;
                        this.getTransactionInfo(historyResponse);
                    }
                },
                error => {
                    this.apiService.handleException(error);
                    this.reactivate();
                }
            );
    }

    private getTransactionInfo(transactions: any) {
        this.transactionArray = [];

        for (const transaction of transactions) {
            let transactionType;
            if (transaction.type === 'send') {
                transactionType = 'sent';
            } else if (transaction.type === 'received') {
                transactionType = 'received';
            } else if (transaction.type === 'staked') {
                transactionType = 'staked';
            }
            const transactionId = transaction.id;
            const transactionAmount = transaction.amount;
            let transactionFee;

            if (transaction.fee) {
                transactionFee = transaction.fee;
            } else {
                transactionFee = 0;
            }

            const transactionConfirmedInBlock = transaction.confirmedInBlock;
            const transactionTimestamp = transaction.timestamp;

            this.transactionArray.push(new TransactionInfo(transactionType, transactionId, transactionAmount, transactionFee, transactionConfirmedInBlock, transactionTimestamp));
        }

        this._history.next(this.transactionArray);
    }

    // "{"enabled":true,"staking":true,"errors":null,"currentBlockSize":151,"currentBlockTx":1,"pooledTx":0,"difficulty":143238.23770936558,"searchInterval":16,"weight":173749360622480,"netStakeWeight":16433501129748,"expectedTime":6}"

    private getStakingInfo() {
        this.stakingInfoSubscription = this.apiService.getStakingInfo()
            .subscribe(
                response => {
                    this.log.info('Get staking info:', response);

                    const stakingResponse = response as StakingInfo;
                    this.stakingInfo = stakingResponse;

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
                },
                error => {
                    this.apiService.handleException(error);
                    this.reactivate();
                }
            );
    }

    private getGeneralWalletInfo() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());

        this.generalWalletInfoSubscription = this.apiService.getGeneralInfoTyped(walletInfo)
            .subscribe(
                response => {
                    this.log.info('Get wallet info:', response);

                    this.generalInfo = response;
                    this.lastBlockSyncedHeight = this.generalInfo.lastBlockSyncedHeight;

                    // Translate the epoch value to a proper JavaScript date.
                    this.generalInfo.creationTime = new Date(this.generalInfo.creationTime * 1000);

                    if (this.generalInfo.lastBlockSyncedHeight) {
                        this.percentSyncedNumber = ((this.generalInfo.lastBlockSyncedHeight / this.generalInfo.chainTip) * 100);
                        if (this.percentSyncedNumber.toFixed(0) === '100' && this.generalInfo.lastBlockSyncedHeight !== this.generalInfo.chainTip) {
                            this.percentSyncedNumber = 99;
                        }

                        this.percentSynced = this.percentSyncedNumber.toFixed(0) + '%';
                    }
                }, error => {
                    this.apiService.handleException(error);
                    this.reactivate();
                }
            );
    }

    private secondsToString(seconds: number) {
        const numDays = Math.floor(seconds / 86400);
        const numHours = Math.floor((seconds % 86400) / 3600);
        const numMinutes = Math.floor(((seconds % 86400) % 3600) / 60);
        const numSeconds = ((seconds % 86400) % 3600) % 60;
        let dateString = '';

        if (numDays > 0) {
            if (numDays > 1) {
                dateString += numDays + ' days ';
            } else {
                dateString += numDays + ' day ';
            }
        }

        if (numHours > 0) {
            if (numHours > 1) {
                dateString += numHours + ' hours ';
            } else {
                dateString += numHours + ' hour ';
            }
        }

        if (numMinutes > 0) {
            if (numMinutes > 1) {
                dateString += numMinutes + ' minutes ';
            } else {
                dateString += numMinutes + ' minute ';
            }
        }

        if (dateString === '') {
            // If dateString is empty at this time, we'll append the seconds. Normally we don't care to show the seconds.
            dateString = numSeconds + ' seconds';
        }

        return dateString;
    }
}
