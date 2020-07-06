import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface HubDialogData {
    url: string;
}

@Component({
    selector: 'app-hub-add',
    templateUrl: 'hub-add.component.html',
    encapsulation: ViewEncapsulation.None
})
export class HubAddComponent {

    constructor(
        public dialogRef: MatDialogRef<HubAddComponent>,
        @Inject(MAT_DIALOG_DATA) public data: HubDialogData) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}
