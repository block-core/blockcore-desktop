import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangesComponent } from './changes/changes.component';
import { LicensesComponent } from './licenses/licenses.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { AboutComponent } from './about.component';
import { AuthenticatedUserGuard } from '../../modules/authentication/guards/authenticated-user.guard';

const routes: Routes = [
    {
        path: '', component: AboutComponent,
        canActivate: [AuthenticatedUserGuard],
        data: {
            title: 'About'
        }
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
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AboutRoutingModule { }
