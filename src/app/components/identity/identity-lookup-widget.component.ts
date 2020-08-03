
import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Identity } from '@models/identity';
import { IdentityService } from 'src/app/services/identity.service';
import { ProfileImageService } from 'src/app/services/profile-image.service';

@Component({
    selector: 'app-identity-lookup-widget',
    templateUrl: './identity-lookup-widget.component.html',
    styleUrls: ['./identity-lookup-widget.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IdentityLookupWidgetComponent implements OnDestroy, OnInit {
    @HostBinding('class.identity-lookup-widget') hostClass = true;
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

    lookup() {
        this.router.navigateByUrl('identity/' + this.searchInput + '/search', { replaceUrl: true });
    }
}

