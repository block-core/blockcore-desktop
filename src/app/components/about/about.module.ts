import { NgModule } from '@angular/core';
import { AboutComponent } from './about.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ViewAreaModule } from '../../shared/view-area/view-area.module';
import { MaterialModule } from '../../material.module';
import { RouterModule } from '@angular/router';
import { AppSharedModule } from '../../shared/app-shared.module';
import { AboutRoutingModule } from './about-routing.module';
import { ChangesModule } from './changes/changes.module';
import { LicensesModule } from './licenses/licenses.module';
import { PrivacyModule } from './privacy/privacy.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        HttpClientModule,
        AppSharedModule,
        MaterialModule,
        ViewAreaModule,
        ChangesModule,
        LicensesModule,
        PrivacyModule,
        AboutRoutingModule
    ],
    declarations: [
        AboutComponent,
    ],
    exports: [
        AboutComponent,
    ]
})
export class AboutModule {
}
