import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { PaymentComponent } from './payment.component';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
    ],
    declarations: [
        PaymentComponent,
    ],
    exports: [
        PaymentComponent,
    ],
})
export class PaymentModule {
}
