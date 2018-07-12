import { NgModule } from '@angular/core';
import { LogoutComponent } from './logout.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { AppServicesModule } from '../../services/services.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        AppServicesModule,
        MaterialModule,
    ],
    declarations: [
        LogoutComponent,
    ],
    exports: [
        LogoutComponent,
    ],
})
export class LogoutModule {
}
