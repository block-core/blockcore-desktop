import { NgModule } from '@angular/core';
import { LoadComponent } from './load.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { FormsModule } from '@angular/forms';
import { AppSharedModule } from 'src/app/shared/app-shared.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        MaterialModule,
        AppSharedModule
    ],
    declarations: [
        LoadComponent,
    ],
    exports: [
        LoadComponent,
    ],
})
export class LoadModule {
}
