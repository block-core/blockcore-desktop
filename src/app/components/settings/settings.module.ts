import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { FormsModule } from '@angular/forms';
import { HubAddComponent } from './hub-add.component';
import { HubDetailsComponent } from './hub-details.component';
import { SettingsRoutingModule } from './settings-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        MaterialModule,
        SettingsRoutingModule
    ],
    declarations: [
        SettingsComponent,
        HubDetailsComponent,
        HubAddComponent
    ],
    exports: [
        SettingsComponent,
        HubDetailsComponent
    ],
    entryComponents: [
        HubAddComponent
    ],
})
export class SettingsModule {
}
