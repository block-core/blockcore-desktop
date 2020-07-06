import { Component, HostBinding, OnDestroy, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { ApplicationStateService } from '../../../services/application-state.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { retry, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-licenses',
    templateUrl: './licenses.component.html',
    styleUrls: ['./licenses.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LicensesComponent implements OnDestroy, OnInit {
    @HostBinding('class.licenses') hostClass = true;

    selectedContent: SafeHtml;

    constructor(
        public appState: ApplicationStateService,
        private readonly cd: ChangeDetectorRef,
        private readonly sanitizer: DomSanitizer,
        private readonly http: HttpClient) {
        this.appState.pageMode = true;
    }

    ngOnDestroy() {
        this.appState.pageMode = false;
    }

    ngOnInit() {
        const dataFormatter = (data) => `<pre>${data.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
        this.showContent('3rdpartylicenses.txt', dataFormatter);
    }

    private showContent(contentUrl: string, dataFormatter: (data: string) => string = data => data) {
        this.http
            .get(contentUrl, { responseType: 'text' }).pipe(
                retry(2),
                tap(
                    data => {
                        const formattedData = dataFormatter(data);
                        this.selectedContent = this.sanitizer.bypassSecurityTrustHtml(formattedData);
                        this.cd.markForCheck();
                    },
                    error => {
                        this.selectedContent = `Unable to get content (${error.statusText})`;
                        this.cd.markForCheck();
                    },
                ),
            ).subscribe();
    }
}
