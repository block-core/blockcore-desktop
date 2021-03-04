import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WalletComponent } from './wallet.component';
import { SendComponent } from './send/send.component';
import { ReceiveComponent } from './receive/receive.component';
import { PaymentComponent } from './payment/payment.component';

const routes: Routes = [
    {
        path: '', component: WalletComponent,
        data: {
            title: 'Wallet',
            animation: 'WalletPage'
        }
    },
    {
        path: 'send',
        component: SendComponent,
        data: {
            title: 'Send',
            prefix: 'Wallet'
        },
    },
    {
        path: 'receive',
        component: ReceiveComponent,
        data: {
            title: 'Receive',
            prefix: 'Wallet'
        },
    },
    {
        path: 'payment',
        component: PaymentComponent,
        data: {
            title: 'Payment',
            prefix: 'Wallet'
        },
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class WalletRoutingModule { }
