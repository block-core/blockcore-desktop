import {
    Component,
    HostBinding,
    ViewEncapsulation,
    ChangeDetectionStrategy,
} from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AboutComponent {
    @HostBinding('class.about') hostClass = true;

    constructor(public appState: ApplicationStateService) {
        this.appState.pageMode = true;
    }
}
