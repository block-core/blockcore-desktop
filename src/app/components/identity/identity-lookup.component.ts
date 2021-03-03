/* eslint-disable */

import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Identity } from '@models/identity';
import { IdentityService } from 'src/app/services/identity.service';
import { ProfileImageService } from 'src/app/services/profile-image.service';

@Component({
    selector: 'app-identity-lookup',
    templateUrl: './identity-lookup.component.html',
    styleUrls: ['./identity-lookup.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IdentityLookupComponent implements OnDestroy, OnInit {
    @HostBinding('class.identity-lookup') hostClass = true;
    searchInput = '';

    public identity: any;
    public container: any;
    public error: string;

    constructor(
        private appState: ApplicationStateService,
        public identityService: IdentityService,
        private profileImageService: ProfileImageService,
        private route: ActivatedRoute,
        public router: Router) {
        this.appState.pageMode = false;

    }

    private sub: any;

    async ngOnInit() {
        this.sub = this.route.params.subscribe(async params => {
            const id = params.id;

            try {
                this.error = null;

                // Attempt to find the identity.
                this.container = await this.identityService.find(id);

                if (this.container) {
                    this.identity = this.container.content;
                }
            }
            catch (err) {
                this.error = err;
                this.container = null;
                this.identity = null;
            }
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}

