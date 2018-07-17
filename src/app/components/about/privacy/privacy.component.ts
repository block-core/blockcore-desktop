import { Component, HostBinding, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ApplicationStateService } from '../../../services/application-state.service';

@Component({
    selector: 'app-privacy',
    templateUrl: './privacy.component.html',
    styleUrls: ['./privacy.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PrivacyComponent implements OnDestroy {
    @HostBinding('class.privacy') hostClass = true;

    constructor(public appState: ApplicationStateService) {
        this.appState.pageMode = true;
    }

    ngOnDestroy() {
        this.appState.pageMode = false;
    }
}
