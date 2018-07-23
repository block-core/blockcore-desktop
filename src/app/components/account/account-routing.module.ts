import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecoverAccountComponent } from './recover/recover.component';
import { CreateAccountComponent } from './create/create.component';

// import { SetupComponent } from './setup.component';
// import { CreateComponent } from './create/create.component';
// import { ShowMnemonicComponent } from './create/show-mnemonic/show-mnemonic.component';
// import { ConfirmMnemonicComponent } from './create/confirm-mnemonic/confirm-mnemonic.component';
// import { RecoverComponent } from './recover/recover.component';

const routes: Routes = [
  //{ path: '', redirectTo: 'account', pathMatch: 'full'},
  { path: '', component: CreateAccountComponent },
  { path: 'create', component: CreateAccountComponent },
  //{ path: 'create/show-mnemonic', component: ShowMnemonicComponent },
  //{ path: 'create/confirm-mnemonic', component: ConfirmMnemonicComponent },
  { path: 'recover', component: RecoverAccountComponent }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})

export class AccountRoutingModule {}
