import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';

export interface Account {
    name: string;
    id: string;
}
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
    @HostBinding('class.login') hostClass = 'login';

    selectedAccount: Account;

    accounts: Account[] = [
        { id: 'steak-0', name: 'main account (CITY)' },
        { id: 'pizza-1', name: 'BTC (BTC)' },
        { id: 'tacos-2', name: 'main (STRAT)' }
    ];

    constructor(private authService: AuthenticationService, private router: Router) {

    }

    login() {
        this.authService.authenticated = true;
        this.router.navigateByUrl('/dashboard');
    }
}
