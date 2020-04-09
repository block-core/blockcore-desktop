import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { ApplicationStateService } from '../../services/application-state.service';
import { NotificationService, NotificationTile } from 'src/app/services/notification.service';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NotificationsComponent implements OnDestroy, OnInit {
    @HostBinding('class.merchant') hostClass = true;

    constructor(
        private appState: ApplicationStateService,
        public notification: NotificationService) {
        this.appState.fullHeight = false;

        this.notification.read();
    }

    remove(tile: NotificationTile) {
        this.notification.remove(tile);
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        this.appState.fullHeight = false;
    }
}
