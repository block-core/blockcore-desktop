import { NgModule } from '@angular/core';
import { ReceiveComponent } from './receive.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
    ],
    declarations: [
        ReceiveComponent,
    ],
    exports: [
        ReceiveComponent,
    ],
})
export class ReceiveModule {

}
