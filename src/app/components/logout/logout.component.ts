import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { GlobalService } from '../../services/global.service';
import { WalletService } from '../../services/wallet.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { Injectable, NgZone } from '@angular/core';
import { BootController } from '../../../boot';

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LogoutComponent {
    @HostBinding('class.logout') hostClass = true;

    loggingOut = false;

    constructor(
        private ngZone: NgZone,
        public wallet: WalletService,
        private authService: AuthenticationService,
        private globalService: GlobalService,
        private apiService: ApiService,
        private appState: ApplicationStateService,
        private router: Router) {

    }

    logout() {
        this.loggingOut = true;

        console.log('Logout is running');

        this.wallet.stop();

        this.authService.setAnonymous();

        this.apiService.stopStaking()
            .subscribe(
                response => {
                    // if (response.status >= 200 && response.status < 400) {
                    console.log('Staking was stopped.');
                    // }
                },
                error => {
                    this.apiService.handleException(error);
                }
            );

        // Triggers the reboot in main.ts
        // this.ngZone.runOutsideAngular(() => BootController.getbootControl().restart());

        this.router.navigateByUrl('/login');
    }
}
