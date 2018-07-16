import { NgModule } from '@angular/core';
import { CreateAccountComponent } from './create/create.component';
import { RecoverAccountComponent } from './recover/recover.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { AppServicesModule } from '../../services/services.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountRoutingModule } from './account-routing.module';
import { AppSharedModule } from '../../shared/app-shared.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        AppServicesModule,
        FormsModule,
        AppSharedModule,
        ReactiveFormsModule,
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
