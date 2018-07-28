import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { MerchantsComponent } from './merchants.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
    ],
    declarations: [
        MerchantsComponent,
    ],
    exports: [
        MerchantsComponent,
    ],
})
export class MerchantsModule {
}
