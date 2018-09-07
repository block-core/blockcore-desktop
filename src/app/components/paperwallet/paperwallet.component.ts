import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';

@Component({
    selector: 'app-paperwallet',
    templateUrl: './paperwallet.component.html',
    styleUrls: ['./paperwallet.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PaperWalletComponent implements OnDestroy, OnInit {
    @HostBinding('class.paperwallet') hostClass = true;

    constructor(private appState: ApplicationStateService) {
        this.appState.fullHeight = true;
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        this.appState.fullHeight = false;
    }
}
