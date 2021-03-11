import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigningComponent } from './signing.component';

const routes: Routes = [
    {
        path: '', component: SigningComponent,
        data: {
            title: 'Signing',
            animation: 'SigningPage'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class SigningRoutingModule { }
