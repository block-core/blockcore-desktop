import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthenticatedUserGuard } from './modules/authentication/guards/authenticated-user.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { LoadComponent } from './components/load/load.component';
import { NetworkComponent } from './components/network/network.component';
import { MerchantsComponent } from './components/merchants/merchants.component';
import { UpdateComponent } from './components/update/update.component';
import { HistoryComponent } from './components/history/history.component';
import { AdvancedComponent } from './components/advanced/advanced.component';
import { PaperWalletComponent } from './components/paperwallet/paperwallet.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/load'
    },
    {
        path: 'load',
        component: LoadComponent,
        data: {
            title: 'Setup'
        },
    },
    {
        path: 'advanced',
        component: AdvancedComponent,
        data: {
            title: 'Advanced Tools'
        },
    },
    {
        path: 'login',
        component: LoginComponent,
        data: {
            title: 'Log in'
        },
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthenticatedUserGuard],
        // canActivate: [AuthenticatedUserGuard, ConnectedToNetworkdGuard],
        data: {
            title: 'Dashboard'
        }
    },
    {
        path: 'paperwallet',
        component: PaperWalletComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'Paperwallet'
        }
    },
    {
        path: 'merchants',
        component: MerchantsComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'Merchants'
        },
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'Settings'
        },
    },
    {
        path: 'logout',
        component: LogoutComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'Log out'
        },
    },
    {
        path: 'network',
        component: NetworkComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'Network Status'
        },
    },
    {
        path: 'update',
        component: UpdateComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'Update City Hub'
        },
    },
    {
        path: 'about',
        loadChildren: './components/about/about.module#AboutModule'
    },
    {
        path: 'wallet',
        loadChildren: './components/wallet/wallet.module#WalletModule'
    },
    {
        path: 'account',
        loadChildren: './components/account/account.module#AccountModule'
    },
    {
        path: 'history',
        loadChildren: './components/history/history.module#HistoryModule'
    },
    {
        path: '**',
        component: NotFoundComponent,
        data: {
            title: 'Not Found',
        },
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule],
})
export class AppRoutingModule { }
