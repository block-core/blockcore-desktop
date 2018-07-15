import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-account-recover',
    templateUrl: './recover.component.html',
    styleUrls: ['./recover.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RecoverAccountComponent {
    @HostBinding('class.account-recover') hostClass = 'account-recover';

    constructor(private authService: AuthenticationService, private router: Router) {

    }
}
