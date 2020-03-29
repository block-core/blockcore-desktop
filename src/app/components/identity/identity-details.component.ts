import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Identity } from '@models/identity';
import { IdentityService } from 'src/app/services/identity.service';
import { ProfileImageService } from 'src/app/services/profile-image.service';

@Component({
    selector: 'app-identity-details',
    templateUrl: './identity-details.component.html',
    styleUrls: ['./identity.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IdentityDetailsComponent implements OnDestroy, OnInit {
    @HostBinding('class.identity') hostClass = true;

    identity: Identity;
    image: any;

    private subscription: any;

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
        this.identity = this.identityService.get(id);

        this.image = this.profileImageService.getImage(this.identity.id);

        // this.subscription = this.identityService.identity$.subscribe(identity => this.identity = identity);

        // Change to this if user can navigate to different identity without going back to list!
        // this.hero$ = this.route.paramMap.pipe(
        //     switchMap((params: ParamMap) =>
        //         this.service.getHero(params.get('id')))
        // );
    }

    ngOnDestroy() {
        // this.subscription.unsubscribe();
    }
}
