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

export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
    { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
    { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
    { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
    { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
    { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
    { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
    { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
    { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
    { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
    { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
    { position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na' },
    { position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg' },
    { position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al' },
    { position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si' },
    { position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P' },
    { position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S' },
    { position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl' },
    { position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar' },
    { position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K' },
    { position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca' },
];

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
        private fb: FormBuilder
    ) {
        this.buildStakingForm();
    }

    private buildStakingForm(): void {
        this.stakingForm = this.fb.group({
            "walletPassword": ["", Validators.required]
        });
    }

    ngOnInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.data = this.wallet.transactionArray;
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

        //const modalRef = this.modalService.open(TransactionDetailsComponent, { backdrop: "static", keyboard: false });
        //modalRef.componentInstance.transaction = transaction;
    }
}
