import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthenticatedUserGuard } from './modules/authentication/guards/authenticated-user.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { AboutComponent } from './components/about/about.component';
import { LicensesComponent } from './components/licenses/licenses.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { ChangesComponent } from './components/changes/changes.component';
import { LoadComponent } from './components/load/load.component';
import { NetworkComponent } from './components/network/network.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/load'
    },
    {
        path: 'load',
        component: LoadComponent,
        //canActivate: [AuthenticatedUserGuard, ConnectedToNetworkdGuard],
        data: {
            title: 'Loading...'
        },
    },
    {
        path: 'login',
        component: LoginComponent,
        //canActivate: [AuthenticatedUserGuard, ConnectedToNetworkdGuard],
        data: {
            title: 'Log in'
        },
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthenticatedUserGuard],
        //canActivate: [AuthenticatedUserGuard, ConnectedToNetworkdGuard],
        data: {
            title: 'Dashboard'
        },
    },
    {
        path: 'wallet',
        component: WalletComponent,
        canActivate: [AuthenticatedUserGuard],
        //canActivate: [AuthenticatedUserGuard, ConnectedToNetworkdGuard],
        data: {
            title: 'Wallet'
        },
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthenticatedUserGuard],
        //canActivate: [AuthenticatedUserGuard, ConnectedToNetworkdGuard],
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
        path: 'about',
        component: AboutComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'About'
        },
    },
    {
        path: 'changes',
        component: ChangesComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'What\'s new',
            prefix: 'About'
        },
    },
    {
        path: 'licenses',
        component: LicensesComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'Third party licenses',
            prefix: 'About'
        },
    },
    {
        path: 'privacy',
        component: PrivacyComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'Privacy Policy',
            prefix: 'About'
        },
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
