/* eslint-disable */

import { Component, HostBinding, OnDestroy, ViewEncapsulation, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ApplicationStateService } from '../../../services/application-state.service';
import { GlobalService } from '../../../services/global.service';
import { ApiService } from '../../../services/api.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { TransactionBuilding } from '../../../classes/transaction-building';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CoinNotationPipe } from '../../../shared/pipes/coin-notation.pipe';
import { FeeEstimation } from '../../../classes/fee-estimation';
import { TransactionSending } from '../../../classes/transaction-sending';
import { WalletInfo } from '../../../classes/wallet-info';
import { Router } from '@angular/router';
import { WalletService } from '../../../services/wallet.service';
import { TransactionResult } from 'src/app/classes/transaction-result';
import { AppModes } from 'src/app/shared/app-modes';

@Component({
    selector: 'app-send',
    templateUrl: './send.component.html',
    styleUrls: ['./send.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SendComponent implements OnInit, OnDestroy {
    @HostBinding('class.send') hostClass = true;

    public sendForm: FormGroup;
    public coinUnit: string;
    public isSending = false;
    public estimatedFee = 0;
    public totalBalance = 0;
    public apiError: string;
    public transactionResult: TransactionResult;
    public transaction: TransactionBuilding;

    public showInputField = true;
    public showSendingField = false;
    public showConfirmationField = false;

    private transactionHex: string;
    private responseMessage: any;
    private errorMessage: string;
    private walletBalanceSubscription: Subscription;

    constructor(
        public readonly appState: ApplicationStateService,
        public appModes: AppModes,
        private apiService: ApiService,
        private location: Location,
        private router: Router,
        private wallet: WalletService,
        private globalService: GlobalService,
        private fb: FormBuilder
    ) {
        this.appState.pageMode = true;
        this.buildSendForm();
    }

    ngOnInit() {
        this.startSubscriptions();
        this.coinUnit = this.globalService.getCoinUnit();
    }

    ngOnDestroy() {
        this.appState.pageMode = false;
        this.cancelSubscriptions();
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    formErrors = {
        address: '',
        amount: '',
        fee: '',
        password: '',
        opreturndata: '',
        opreturnamount: ''
    };

    // eslint-disable-next-line @typescript-eslint/member-ordering
    validationMessages = {
        address: {
            required: 'An address is required.',
            minlength: 'An address is at least 26 characters long.'
        },
        amount: {
            required: 'An amount is required.',
            pattern: 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
            min: 'The amount has to be more or equal to 0.00001 City.',
            max: 'The total transaction amount exceeds your available balance.'
        },
        fee: {
            required: 'A fee is required.'
        },
        password: {
            required: 'Your password is required.'
        },
        opreturndata: {
            max: 'Maximum 80 characters.'
        },
        opreturnamount: {
            pattern: 'Enter a valid amount. Only positive numbers and no more than 8 decimals are allowed.',
        }
    };

    private buildSendForm(): void {
        this.sendForm = this.fb.group({
            address: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
            amount: ['', Validators.compose([Validators.required, Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/), Validators.min(0.00001), (control: AbstractControl) => Validators.max((this.totalBalance - this.estimatedFee) / 100000000)(control)])],
            fee: ['medium', Validators.required],
            password: ['', Validators.required],
            shuffleOutputs: [true],
            opreturndata: ['', Validators.compose([Validators.maxLength(this.appState.activeChain.opreturndata)])], // TODO: This is maxLength for ASCII, with UNICODE it can be longer but node will throw error then. Make a custom validator that encodes UTF8 to bytes.
            opreturnamount: ['', Validators.compose([Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/)])],
        });

        this.sendForm.valueChanges.pipe(debounceTime(300))
            .subscribe(data => this.onValueChanged(data));
    }

    cancel() {
        this.isSending = false;
        this.location.back();
    }

    onValueChanged(data?: any) {
        if (!this.sendForm) { return; }
        const form = this.sendForm;

        // eslint-disable-next-line guard-for-in
        for (const field in this.formErrors) {
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];

                // eslint-disable-next-line guard-for-in
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }

        this.apiError = '';

        if (this.sendForm.get('address').valid && this.sendForm.get('amount').valid) {
            this.estimateFee();
        }
    }

    public getMaxBalance() {
        const data = {
            walletName: this.globalService.getWalletName(),
            accontName: 'account 0',
            feeType: this.sendForm.get('fee').value
        };

        let balanceResponse;

        this.apiService
            .getMaximumBalance(data)
            .subscribe(
                response => {
                    // if (response.status >= 200 && response.status < 400) {
                    balanceResponse = response;
                    // }
                },
                error => {
                    console.log(error);
                    if (error.status === 0) {
                        // this.genericModalService.openModal(null, null);
                        this.apiError = 'Something went wrong while connecting to the API. Please restart the application.';
                    } else if (error.status >= 400) {
                        this.apiService.handleException(error);

                        if (!error.error.errors[0]) {
                        } else {
                            this.apiError = error.error.errors[0].message;
                        }
                    }
                },
                () => {
                    this.sendForm.patchValue({ amount: +new CoinNotationPipe(this.globalService).transform(balanceResponse.maxSpendableAmount) });
                    this.estimatedFee = balanceResponse.fee;
                }
            );
    }

    public estimateFee() {
        const transaction = new FeeEstimation(
            this.globalService.getWalletName(),
            'account 0',
            this.sendForm.get('address').value.trim(),
            this.sendForm.get('amount').value,
            this.sendForm.get('fee').value,
            true,
            this.sendForm.get('opreturndata').value,
            this.sendForm.get('opreturnamount').value,
        );

        this.apiService.estimateFee(transaction)
            .subscribe(
                response => {
                    // if (response.status >= 200 && response.status < 400) {
                    this.responseMessage = response;
                    // }
                },
                error => {
                    console.log(error);
                    if (error.status === 0) {
                        // this.genericModalService.openModal(null, null);
                    } else if (error.status >= 400) {

                        this.apiService.handleException(error);

                        if (!error.error.errors[0]) {
                            this.apiError = error;
                        } else {
                            // this.genericModalService.openModal(null, error.json().errors[0].message);
                            this.apiError = error.error.errors[0].message;
                        }
                    }
                },
                () => {
                    this.estimatedFee = this.responseMessage;
                }
            )
            ;
    }

    public buildTransaction() {
        this.transaction = new TransactionBuilding(
            this.globalService.getWalletName(),
            'account 0',
            this.sendForm.get('password').value,
            this.sendForm.get('address').value.trim(),
            this.sendForm.get('amount').value,
            this.sendForm.get('fee').value,
            // TO DO: use coin notation
            this.estimatedFee / 100000000,
            true,
            this.sendForm.get('shuffleOutputs').value,
            this.wallet.isSingleAddressMode,
            this.sendForm.get('opreturndata').value,
            this.sendForm.get('opreturnamount').value,
        );

        this.apiService
            .buildTransaction(this.transaction)
            .subscribe(
                response => {
                    // if (response.status >= 200 && response.status < 400) {
                    console.log(response);
                    this.responseMessage = response;
                    // }
                },
                error => {
                    console.log(error);

                    this.isSending = false;
                    this.showInputField = true;
                    this.showConfirmationField = false;
                    this.showSendingField = false;

                    if (error.status === 0) {
                        // this.genericModalService.openModal(null, null);
                        this.apiError = 'Something went wrong while connecting to the API. Please restart the application.';
                    } else if (error.status >= 400) {

                        this.apiService.handleException(error);

                        if (!error.error.errors[0]) {

                        } else {
                            // this.genericModalService.openModal(null, error.json().errors[0].message);
                            this.apiError = error.error.errors[0].message;
                        }
                    }
                },
                () => {
                    this.estimatedFee = this.responseMessage.fee;
                    this.transactionHex = this.responseMessage.hex;

                    if (this.isSending) {
                        this.sendTransaction(this.transactionHex);
                    }
                }
            );
    }

    public send() {
        this.isSending = true;

        this.showInputField = false;
        this.showConfirmationField = false;
        this.showSendingField = true;

        this.buildTransaction();
    }

    private sendTransaction(hex: string) {
        const transaction = new TransactionSending(hex);
        this.apiService
            .sendTransaction(transaction)
            .subscribe(
                response => {
                    this.transactionResult = response;
                },
                error => {
                    console.log(error);
                    this.isSending = false;
                    if (error.status === 0) {
                        // this.genericModalService.openModal(null, null);
                        this.apiError = 'Something went wrong while connecting to the API. Please restart the application.';
                    } else if (error.status >= 400) {

                        this.apiService.handleException(error);

                        if (!error.error.errors[0]) {

                        } else {
                            // this.genericModalService.openModal(null, error.json().errors[0].message);
                            this.apiError = error.error.errors[0].message;
                        }
                    }
                },
                () => this.openConfirmationModal()
            )
            ;
    }

    private getWalletBalance() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());
        this.walletBalanceSubscription = this.apiService.getWalletBalance(walletInfo)
            .subscribe(
                response => {
                    // if (response.status >= 200 && response.status < 400) {
                    const balanceResponse = response;
                    // TO DO - add account feature instead of using first entry in array
                    this.totalBalance = balanceResponse.balances[0].amountConfirmed + balanceResponse.balances[0].amountUnconfirmed;
                    // }
                },
                error => {
                    console.log(error);
                    if (error.status === 0) {
                        // We used to cancelSubscription here, not a good idea if it fails the first time.
                        // this.cancelSubscriptions();
                        // this.genericModalService.openModal(null, null);
                    } else if (error.status >= 400) {

                        this.apiService.handleException(error);

                        if (!error.error.errors[0]) {

                        } else {
                            if (error.error.errors[0].description) {
                                // this.genericModalService.openModal(null, error.json().errors[0].message);
                            } else {
                                this.cancelSubscriptions();
                                this.startSubscriptions();
                            }
                        }
                    }
                }
            );
    }

    // public get sentAmount(): number {
    //     return Number(this.transaction.amount);
    // }

    private openConfirmationModal() {

        console.log('Show confirmation TX: ', this.transaction);
        console.log('Show confirmation FEE: ', this.estimatedFee);

        this.showSendingField = false;
        this.showConfirmationField = true;

        // const modalRef = this.modalService.open(SendConfirmationComponent, { backdrop: "static" });
        // modalRef.componentInstance.transaction = this.transaction;
        // modalRef.componentInstance.transactionFee = this.estimatedFee;
    }

    private cancelSubscriptions() {
        if (this.walletBalanceSubscription) {
            this.walletBalanceSubscription.unsubscribe();
        }
    }

    private startSubscriptions() {
        this.getWalletBalance();
    }
}
