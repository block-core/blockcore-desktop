import { NgModule } from '@angular/core';
import { ReceiveComponent } from './receive.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxQRCodeModule } from 'ngx-qrcode2';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ClipboardModule,
        NgxQRCodeModule,
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
