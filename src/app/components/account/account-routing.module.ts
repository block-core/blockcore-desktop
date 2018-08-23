import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecoverAccountComponent } from './recover/recover.component';
import { CreateAccountComponent } from './create/create.component';

const routes: Routes = [
  { path: '', component: CreateAccountComponent },
  { path: 'create', component: CreateAccountComponent },
  { path: 'recover', component: RecoverAccountComponent }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})

export class AccountRoutingModule {}
