import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecoverAccountComponent } from './recover/recover.component';
import { CreateAccountComponent } from './create/create.component';

const routes: Routes = [
    {
        path: '',
        component: CreateAccountComponent,
        data: {
            title: 'Create Account'
        }
    },
    {
        path: 'create',
        component: CreateAccountComponent,
        data: {
            title: 'Create Account'
        }
    },
    {
        path: 'recover',
        component: RecoverAccountComponent,
        data: {
            title: 'Recover Account'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AccountRoutingModule { }
