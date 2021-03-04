import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { NotificationsComponent } from './notifications.component';
import { NotificationsRoutingModule } from './notifications-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
        NotificationsRoutingModule
    ],
    declarations: [
        NotificationsComponent,
    ],
    // exports: [
    //     NotificationsComponent,
    // ],
})
export class NotificationsModule {
}
