import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IdentityUnlockComponent } from './identity-unlock.component';
import { IdentityViewComponent } from './identity-view.component';
import { IdentityComponent } from './identity.component';

const routes: Routes = [
    {
        path: '',
        component: IdentityComponent,
        data: {
            title: 'Identity'
        },
    },
    {
        path: ':id',
        component: IdentityViewComponent,
        data: {
            title: 'Identity',
            prefix: 'View'
        },
    },
    {
        path: ':id/edit',
        component: IdentityViewComponent,
        data: {
            title: 'Identity',
            prefix: 'Edit'
        },
    },
    {
        path: ':id/unlock',
        component: IdentityUnlockComponent,
        data: {
            title: 'Identity',
            prefix: 'Unlock'
        },
    },
    {
        path: ':id/export',
        component: IdentityViewComponent,
        data: {
            title: 'Identity',
            prefix: 'Export'
        },
    },
    {
        path: ':id/search',
        component: IdentityUnlockComponent,
        data: {
            title: 'Identity',
            prefix: 'Lookup'
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class IdentityRoutingModule { }
