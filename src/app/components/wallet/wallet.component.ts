import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
    public displayedColumns: string[] = ['transactionType', 'transactionAmount', 'transactionTimestamp', 'actions'];
    public dataSource = new MatTableDataSource<TransactionInfo>();
    private walletServiceSubscription: Subscription;

    @ViewChild(MatPaginator) paginator: MatPaginator;

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

        // "Cannot read property 'length' of undefined" error when setting to empty value.
        if (this.wallet.transactionArray != null) {
            this.dataSource.data = this.wallet.transactionArray;
        }

        this.walletServiceSubscription = this.wallet.history$.subscribe(items => {
            this.dataSource.data = <any>items;
            this.ref.detectChanges();
        });
    }

    ngOnDestroy() {
        if (this.walletServiceSubscription) {
            this.walletServiceSubscription.unsubscribe();
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
