/* eslint-disable */

import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup, NgForm, FormGroupDirective } from '@angular/forms';
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

@Component({
    selector: 'app-signing',
    templateUrl: './signing.component.html',
    styleUrls: ['./signing.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SigningComponent implements OnInit {
    @HostBinding('class.wallet') hostClass = true;

    public signingForm: FormGroup;
    public verifyForm: FormGroup;
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
        this.buildsForms();
        this.appState.pageMode = false;
    }

    private buildsForms(): void {
        this.signingForm = this.fb.group({
            signingAddress: ['', Validators.required],
            signingMessage: ['']
        });

        this.verifyForm = this.fb.group({
            signingAddress: ['', Validators.required],
            signingMessage: [''],
            signingSignature: ['', Validators.required]
        });
    }

    ngOnInit() {

    }

    sign(form: FormGroupDirective) {

    }

    verify(form: FormGroupDirective) {

    }

    clear(form: FormGroupDirective) {
        form.resetForm();
    }
}
