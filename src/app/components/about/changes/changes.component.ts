import { Component, HostBinding, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ApplicationStateService } from '../../../services/application-state.service';

@Component({
    selector: 'app-changes',
    templateUrl: './changes.component.html',
    styleUrls: ['./changes.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChangesComponent implements OnDestroy {
    @HostBinding('class.changes') hostClass = true;

    constructor(public readonly appState: ApplicationStateService) {
        this.appState.pageMode = true;
    }

    ngOnDestroy() {
        this.appState.pageMode = false;
    }
}
