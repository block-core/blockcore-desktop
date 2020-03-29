import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Link } from '@models/link';

@Component({
    selector: 'app-link-add',
    templateUrl: 'link-add.component.html',
    styleUrls: ['./link-add.component.scss'],
})
export class LinkAddComponent {

    constructor(
        public dialogRef: MatDialogRef<LinkAddComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Link) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}
