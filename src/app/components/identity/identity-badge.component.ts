import { Component, ViewEncapsulation, Input, OnInit } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { Identity, IdentityContainer } from '@models/identity';
import { IdentityService } from 'src/app/services/identity.service';
import { ProfileImageService } from 'src/app/services/profile-image.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-identity-badge',
    templateUrl: './identity-badge.component.html',
    encapsulation: ViewEncapsulation.None
})
export class IdentityBadgeComponent implements OnInit {

    @Input() identity: IdentityContainer | Identity;
    public hasContainer = true;
    public container: any;

    constructor(
        private appState: ApplicationStateService,
        private profileImageService: ProfileImageService,
        private snackBar: MatSnackBar,
        public identityService: IdentityService) {

    }

    ngOnInit() {
        if (this.identity instanceof Identity) {
            this.hasContainer = false;
            this.container = { content: this.identity };
        }
        else {
            this.container = this.identity;
        }

        console.log(this.identity);
        console.log(this.container);
    }

    public onCopiedClick() {
        this.snackBar.open('Identity identifier has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }
}
