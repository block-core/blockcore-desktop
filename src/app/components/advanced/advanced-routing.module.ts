import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdvancedComponent } from './advanced.component';

const routes: Routes = [
    {
        path: '',
        component: AdvancedComponent,
        data: {
            title: 'Advanced Tools',
            animation: 'AdvancedPage'
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AdvancedRoutingModule { }
