import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { UpdateService } from '../../services/update.service';

@Component({
    selector: 'app-update',
    templateUrl: './update.component.html',
    styleUrls: ['./update.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UpdateComponent {
    @HostBinding('class.update') hostClass = true;

    public installEnabled;

    constructor(public updateService: UpdateService) {

    }
}
