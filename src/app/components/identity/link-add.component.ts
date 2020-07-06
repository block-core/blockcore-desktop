import { Component, Inject, HostBinding, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Link } from '@models/link';

@Component({
    selector: 'app-link-add',
    templateUrl: 'link-add.component.html',
    styleUrls: ['./link-add.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LinkAddComponent {
    @HostBinding('class.link-add') hostClass = true;

    constructor(
        public dialogRef: MatDialogRef<LinkAddComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Link) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}
