import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface NodeDialogData {
    ip: string;
}

@Component({
    selector: 'app-network-add-node',
    templateUrl: 'network-add-node.component.html',
    encapsulation: ViewEncapsulation.None
})
export class NetworkAddNodeComponent {

    constructor(
        public dialogRef: MatDialogRef<NetworkAddNodeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: NodeDialogData) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}
