import { Component, HostBinding, OnDestroy } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';

@Component({
    selector: 'app-changes',
    templateUrl: './changes.component.html',
    styleUrls: ['./changes.component.scss']
})
export class ChangesComponent implements OnDestroy {
    @HostBinding('class.changes') hostClass = 'changes';

    constructor(public readonly appState: ApplicationStateService) {
        this.appState.pageMode = true;
    }

    ngOnDestroy() {
        this.appState.pageMode = false;
    }
}
