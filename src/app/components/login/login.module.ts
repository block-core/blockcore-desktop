import { NgModule } from '@angular/core';
import { LoginComponent } from './login.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { AppServicesModule } from '../../services/services.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        AppServicesModule,
        FormsModule,
        MaterialModule,
    ],
    declarations: [
        LoginComponent,
    ],
    exports: [
        LoginComponent,
    ],
})
export class LoginModule {
}
