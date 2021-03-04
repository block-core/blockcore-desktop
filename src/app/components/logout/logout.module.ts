import { NgModule } from '@angular/core';
import { LogoutComponent } from './logout.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { LogoutRoutingModule } from './logout-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
        LogoutRoutingModule
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
