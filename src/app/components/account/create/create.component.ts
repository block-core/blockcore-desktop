import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-account-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CreateAccountComponent {
    @HostBinding('class.account-create') hostClass = 'account-create';

    constructor(private authService: AuthenticationService, private router: Router) {

    }
}
