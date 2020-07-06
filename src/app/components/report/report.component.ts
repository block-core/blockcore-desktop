import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClipboardService } from 'ngx-clipboard';
import { ApplicationStateService } from 'src/app/services/application-state.service';


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
    encapsulation: ViewEncapsulation.None
})
export class ReportComponent {

    constructor(
        public snackBar: MatSnackBar,
        private clipboardService: ClipboardService,
        private appState: ApplicationStateService,
        public dialogRef: MatDialogRef<ReportComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ReportDialogData) {
    }

    public shutdown() {
        // When we exit from this error report dialog, we'll reset the daemon selection options to start fresh.
        this.appState.resetNetworkSelection();

        window.close();
    }

    public onCopiedClick() {
        this.clipboardService.copyFromContent(document.getElementById('error-lines').innerText);
        this.snackBar.open('The error log has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }
}
