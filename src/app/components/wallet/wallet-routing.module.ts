import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticatedUserGuard } from '../../modules/authentication/guards/authenticated-user.guard';
import { WalletComponent } from './wallet.component';
import { SendComponent } from './send/send.component';
import { ReceiveComponent } from './receive/receive.component';

const routes: Routes = [
    {
        path: '', component: WalletComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'Wallet'
        }
    },
    {
        path: 'send',
        component: SendComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'Send',
            prefix: 'Wallet'
        },
    },
    {
        path: 'receive',
        component: ReceiveComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'Receive',
            prefix: 'Wallet'
        },
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class WalletRoutingModule { }
