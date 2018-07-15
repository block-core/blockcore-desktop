import { NgModule } from '@angular/core';
import { CreateAccountComponent } from './create/create.component';
import { RecoverAccountComponent } from './recover/recover.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { AppServicesModule } from '../../services/services.module';
import { FormsModule } from '@angular/forms';
import { AccountRoutingModule } from './account-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        AppServicesModule,
        FormsModule,
        MaterialModule,
        AccountRoutingModule,
    ],
    declarations: [
        CreateAccountComponent,
        RecoverAccountComponent,
    ],
    exports: [
        CreateAccountComponent,
        RecoverAccountComponent
    ],
})
export class AccountModule {
}
