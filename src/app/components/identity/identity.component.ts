import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { Identity } from '@models/identity';
import { SettingsService } from 'src/app/services/settings.service';
import { IdentityService } from 'src/app/services/identity.service';

@Component({
    selector: 'app-identity',
    templateUrl: './identity.component.html',
    styleUrls: ['./identity.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IdentityComponent implements OnDestroy, OnInit {
    @HostBinding('class.identity') hostClass = true;

    // public identities: Identity[];

    constructor(
        private appState: ApplicationStateService,
        public identityService: IdentityService,
        private readonly cd: ChangeDetectorRef,
        public settings: SettingsService) {
        this.appState.pageMode = false;
    }

    ngOnInit() {
        // this.identities = this.settings.identities;
        // console.log(this.identities);
    }

    ngOnDestroy() {

    }

    delete(id: string) {
        this.identityService.remove(id);
        // this.identities = this.settings.identities;
        this.cd.markForCheck();
    }
}
