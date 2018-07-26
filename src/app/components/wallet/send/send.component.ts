import { Component, HostBinding, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ApplicationStateService } from '../../../services/application-state.service';

@Component({
    selector: 'app-send',
    templateUrl: './send.component.html',
    styleUrls: ['./send.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SendComponent implements OnDestroy {
    @HostBinding('class.send') hostClass = true;

    constructor(public readonly appState: ApplicationStateService) {
        this.appState.pageMode = true;
    }

    ngOnDestroy() {
        this.appState.pageMode = false;
    }
}
