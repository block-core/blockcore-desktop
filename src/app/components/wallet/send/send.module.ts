import { NgModule } from '@angular/core';
import { SendComponent } from './send.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { AppSharedModule } from '../../../shared/app-shared.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        AppSharedModule,
        ReactiveFormsModule,
        MaterialModule,
    ],
    declarations: [
        SendComponent,
    ],
    exports: [
        SendComponent,
    ],
})
export class SendModule {

}
