import { NgModule } from '@angular/core';
import { AboutComponent } from './about.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ViewAreaModule } from '../../shared/view-area/view-area.module';
import { MaterialModule } from '../../material.module';
import { AppServicesModule } from '../../services/services.module';
import { RouterModule } from '@angular/router';
import { AppSharedModule } from '../../shared/app-shared.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        HttpClientModule,
        AppServicesModule,
        AppSharedModule,
        MaterialModule,
        ViewAreaModule
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
