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
    public signature: string;
    public validSignature = null;

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
        private ref: ChangeDetectorRef,
    ) {
        this.buildsForms();
        this.appState.pageMode = false;
    }

    private buildsForms(): void {
        this.signingForm = this.fb.group({
            signingAddress: ['', Validators.required],
            signingPassword: ['', Validators.required],
            signingMessage: ['']
        });

        this.verifyForm = this.fb.group({
            verifyAddress: ['', Validators.required],
            verifyMessage: [''],
            verifySignature: ['', Validators.required]
        });
    }

    ngOnInit() {

    }

    sign() {
        const address = this.signingForm.get('signingAddress').value;
        const message = this.signingForm.get('signingMessage').value;
        const password = this.signingForm.get('signingPassword').value;
        this.signature = null;

        this.apiService.signMessage(this.wallet.walletName, password, 'account 0', address, message).subscribe(response => {
            console.log(response);
            this.signature = response.signature;
        });

        this.signingForm.get('signingPassword').reset();
    }

    verify() {
        const address = this.verifyForm.get('verifyAddress').value;
        const message = this.verifyForm.get('verifyMessage').value;
        const signature = this.verifyForm.get('verifySignature').value;

        this.apiService.verifyMessage(address, message, signature).subscribe(response => {
            this.validSignature = response == 'True';
        });
    }

    clear(form: FormGroupDirective) {
        form.resetForm();
    }
}
