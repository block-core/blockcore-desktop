import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface UtxoCountDialogData {
    count: number;
    amount: number;
    utxos: number;
    password: string;
}

@Component({
    selector: 'app-wallet-utxo-count-dialog',
    templateUrl: 'wallet-utxo-count-dialog.html',
    encapsulation: ViewEncapsulation.None
})
export class WalletUtxoCountDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<WalletUtxoCountDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UtxoCountDialogData) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}
