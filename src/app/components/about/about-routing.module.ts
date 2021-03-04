import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangesComponent } from './changes/changes.component';
import { LicensesComponent } from './licenses/licenses.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { AboutComponent } from './about.component';

const routes: Routes = [
    {
        path: '', component: AboutComponent,
        data: {
            title: 'About',
            animation: 'AboutPage'
        }
    },
    {
        path: 'changes',
        component: ChangesComponent,
        data: {
            title: 'What\'s new',
            prefix: 'About'
        },
    },
    {
        path: 'licenses',
        component: LicensesComponent,
        data: {
            title: 'Third party licenses',
            prefix: 'About'
        },
    },
    {
        path: 'privacy',
        component: PrivacyComponent,
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
