import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationStateService } from 'src/app/services/application-state.service';
import { Clipboard } from '@angular/cdk/clipboard';

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
        private clipboard: Clipboard,
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
        this.clipboard.copy(document.getElementById('error-lines').innerText);

        this.snackBar.open('The error log has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }
}
