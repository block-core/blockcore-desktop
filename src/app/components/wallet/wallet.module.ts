import { NgModule } from '@angular/core';
import { WalletComponent } from './wallet.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { ReceiveModule } from './receive/receive.module';
import { SendModule } from './send/send.module';
import { WalletRoutingModule } from './wallet-routing.module';
import { PaymentModule } from './payment/payment.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppSharedModule } from '../../shared/app-shared.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReceiveModule,
        SendModule,
        ReactiveFormsModule,
        FormsModule,
        AppSharedModule,
        PaymentModule,
        MaterialModule,
        WalletRoutingModule
    ],
    declarations: [
        WalletComponent,
    ],
    exports: [
        WalletComponent,
    ],
})
export class WalletModule {
}
