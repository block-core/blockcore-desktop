import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface NodeDialogData {
    ip: string;
    seconds: number;
}

@Component({
    selector: 'app-network-ban-node',
    templateUrl: 'network-ban-node.component.html',
    encapsulation: ViewEncapsulation.None
})
export class NetworkBanNodeComponent {

    constructor(
        public dialogRef: MatDialogRef<NetworkBanNodeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: NodeDialogData) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}
