import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        MaterialModule,
    ],
    declarations: [
        SettingsComponent,
    ],
    exports: [
        SettingsComponent,
    ],
})
export class SettingsModule {
}
