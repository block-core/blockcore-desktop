import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';

@Component({
    selector: 'app-merchants',
    templateUrl: './merchants.component.html',
    styleUrls: ['./merchants.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MerchantsComponent implements OnDestroy, OnInit {
    @HostBinding('class.merchant') hostClass = true;

    constructor(private appState: ApplicationStateService) {
        this.appState.fullHeight = true;
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        this.appState.fullHeight = false;
    }
}
