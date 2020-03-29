import { NgModule } from '@angular/core';
import { RootComponent } from './root.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { ViewAreaModule } from '../../shared/view-area/view-area.module';
import { AppSharedModule } from '../../shared/app-shared.module';
import { DetailsModule } from '../details/details.module';
import { IdentityModule } from '../identity/identity.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
        AppSharedModule,
        DetailsModule,
        ViewAreaModule,
        IdentityModule
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
