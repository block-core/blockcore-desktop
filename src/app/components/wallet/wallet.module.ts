import { NgModule } from '@angular/core';
import { WalletComponent } from './wallet.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { ReceiveModule } from './receive/receive.module';
import { SendModule } from './send/send.module';
import { WalletRoutingModule } from './wallet-routing.module';
import { PaymentModule } from './payment/payment.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReceiveModule,
        SendModule,
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
