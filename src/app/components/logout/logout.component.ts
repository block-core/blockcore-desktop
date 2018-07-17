import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent {
    @HostBinding('class.logout') hostClass = true;

    constructor(private authService: AuthenticationService, private router: Router) {

    }

    logout() {
        this.authService.authenticated = false;
        this.router.navigateByUrl('/login');
    }
}
