import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HubDetailsComponent } from './hub-details.component';
import { SettingsComponent } from './settings.component';

const routes: Routes = [
    {
        path: '',
        component: SettingsComponent,
        data: {
            title: 'Settings'
        },
    },
    {
        path: 'hubs',
        component: HubDetailsComponent,
        data: {
            title: 'Manage Hubs'
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class SettingsRoutingModule { }
