import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NetworkDetailsComponent } from './network-details.component';
import { NetworkComponent } from './network.component';

const routes: Routes = [
    {
        path: '',
        component: NetworkComponent,
        data: {
            title: 'Network Status',
            animation: 'StatusPage'
        },
    },
    {
        path: 'details',
        component: NetworkDetailsComponent,
        data: {
            title: 'Network Details'
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class NetworkRoutingModule { }
