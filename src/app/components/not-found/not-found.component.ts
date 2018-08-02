import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NotFoundComponent {
    @HostBinding('class.app-not-found') hostClass = true;
}
