import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { WalletService } from '../../services/wallet.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { DetailsService } from '../../services/details.service';
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { TransactionInfo } from '../../classes/transaction-info';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { AppModes } from '../../shared/app-modes';

@Component({
    selector: 'app-wallet',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WalletComponent implements OnInit {
    @HostBinding('class.wallet') hostClass = true;

    private stakingForm: FormGroup;

    // public transactionType: string;
    // public transactionId: string;
    // public transactionAmount: number;
    // public transactionFee: number;
    // public transactionConfirmedInBlock?: number;
    // public transactionTimestamp: number;

    displayedColumns: string[] = ['transactionType', 'transactionAmount', 'transactionTimestamp', 'actions'];
    dataSource = new MatTableDataSource<TransactionInfo>();

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(
        private apiService: ApiService,
        private globalService: GlobalService,
        private router: Router,
        public appState: ApplicationStateService,
        private detailsService: DetailsService,
        public wallet: WalletService,
        public appModes: AppModes,
        private fb: FormBuilder
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

        // "Cannot read property 'length' of undefined" error when setting to empty value.
        if (this.wallet.transactionArray != null) {
            this.dataSource.data = this.wallet.transactionArray;
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

        // const modalRef = this.modalService.open(TransactionDetailsComponent, { backdrop: "static", keyboard: false });
        // modalRef.componentInstance.transaction = transaction;
    }
}
