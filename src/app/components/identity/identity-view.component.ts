import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Identity, IdentityContainer } from '@models/identity';
import { IdentityService } from 'src/app/services/identity.service';
import { ProfileImageService } from 'src/app/services/profile-image.service';

@Component({
    selector: 'app-identity-view',
    templateUrl: './identity-view.component.html',
    styleUrls: ['./identity-view.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IdentityViewComponent implements OnDestroy, OnInit {
    @HostBinding('class.identity-view') hostClass = true;

    identityContainer: IdentityContainer;
    image: any;

    constructor(
        private appState: ApplicationStateService,
        public identityService: IdentityService,
        private profileImageService: ProfileImageService,
        private route: ActivatedRoute,
        public router: Router) {
        this.appState.pageMode = false;

    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        console.log('ID:', id);
        this.identityContainer = this.identityService.get(id);

        // this.image = this.profileImageService.getImage(this.identity.id);
    }

    ngOnDestroy() {
    }
}
