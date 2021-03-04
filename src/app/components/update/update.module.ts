import { NgModule } from '@angular/core';
import { UpdateComponent } from './update.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { AppSharedModule } from '../../shared/app-shared.module';
import { UpdateRoutingModule } from './update-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
        AppSharedModule,
        UpdateRoutingModule
    ],
    declarations: [
        UpdateComponent,
    ],
    exports: [
        UpdateComponent,
    ],
})
export class UpdateModule {
}
