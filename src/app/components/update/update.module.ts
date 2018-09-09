import { NgModule } from '@angular/core';
import { UpdateComponent } from './update.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { AppSharedModule } from '../../shared/app-shared.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
        AppSharedModule
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
