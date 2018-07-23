import { NgModule } from '@angular/core';
import { RootComponent } from './root.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { ViewAreaModule } from '../../shared/view-area/view-area.module';
import { AppServicesModule } from '../../services/services.module';
import { AppSharedModule } from '../../shared/app-shared.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
        AppServicesModule,
        AppSharedModule,
        ViewAreaModule
    ],
    declarations: [
        RootComponent,
    ],
    exports: [
        RootComponent,
    ],
})
export class RootModule {
}
