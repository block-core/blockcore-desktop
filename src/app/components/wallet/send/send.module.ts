import { NgModule } from '@angular/core';
import { SendComponent } from './send.component';
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
        SendComponent,
    ],
    exports: [
        SendComponent,
    ],
})
export class SendModule {

}
