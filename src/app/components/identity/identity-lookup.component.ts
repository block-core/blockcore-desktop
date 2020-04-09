
import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Identity } from '@models/identity';
import { IdentityService } from 'src/app/services/identity.service';
import { ProfileImageService } from 'src/app/services/profile-image.service';

@Component({
    selector: 'app-identity-lookup',
    templateUrl: './identity-lookup.component.html',
    styleUrls: ['./identity-lookup.component.scss']
})
export class IdentityLookupComponent implements OnDestroy, OnInit {
    @HostBinding('class.identity-lookup') hostClass = true;
    searchInput = '';

    constructor(
        private appState: ApplicationStateService,
        public identityService: IdentityService,
        private profileImageService: ProfileImageService,
        private route: ActivatedRoute,
        public router: Router) {
        this.appState.pageMode = false;

    }

    ngOnInit() {

    }

    ngOnDestroy() {
    }
}

