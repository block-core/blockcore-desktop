import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material';
import { ClipboardService } from 'ngx-clipboard';


export interface ReportDialogData {
    title: string;
    animal: string;
    name: string;
    lines: any[];
}

@Component({
    selector: 'app-report-component',
    templateUrl: 'report.component.html',
    styleUrls: ['report.component.scss'],
})
export class ReportComponent {

    constructor(
        public snackBar: MatSnackBar,
        private clipboardService: ClipboardService,
        public dialogRef: MatDialogRef<ReportComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ReportDialogData) {
            console.log(data);
        }

        public shutdown() {
            window.close();
        }

    public onCopiedClick() {
        this.clipboardService.copyFromContent(document.getElementById('error-lines').innerText);
        this.snackBar.open('The error log has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }
}
