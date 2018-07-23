import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { ApplicationStateService } from '../../services/application-state.service';

export interface Mode {
    name: string;
    id: string;
}
@Component({
    selector: 'app-load',
    templateUrl: './load.component.html',
    styleUrls: ['./load.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LoadComponent {
    @HostBinding('class.load') hostClass = true;

    selectedMode: Mode;
    hasWallet = false;
    modes: Mode[] = [];
    remember: boolean;

    constructor(private authService: AuthenticationService, private router: Router, private appState: ApplicationStateService) {

        this.modes = [
            { id: 'simple', name: 'Mobile' },
            { id: 'light', name: 'Light' },
            { id: 'full', name: 'Full' },
            { id: 'pos', name: 'Point-of-Sale (POS)' },
            { id: 'readonly', name: 'Read-only' }
        ];

        // If user has choosen to remember mode, we'll redirect directly to login.
        if (localStorage.getItem('Mode') != null) {
            this.router.navigateByUrl('/login');
        }
    }

    launch() {
        if (this.remember) {
            localStorage.setItem('Mode', this.selectedMode.id);
        }

        this.appState.mode = this.selectedMode.id;

        this.router.navigateByUrl('/login');
    }
}
