import { NgModule } from '@angular/core';
import { PrivacyComponent } from './privacy.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { AppSharedModule } from '../../../shared/app-shared.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        AppSharedModule,
        MaterialModule,
    ],
    declarations: [
        PrivacyComponent,
    ],
    exports: [
        PrivacyComponent,
    ],
})
export class PrivacyModule {
    constructor() { }
}
