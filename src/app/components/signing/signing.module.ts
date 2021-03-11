import { NgModule } from '@angular/core';
import { SigningComponent } from './signing.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppSharedModule } from '../../shared/app-shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SigningRoutingModule } from './signing-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        FormsModule,
        AppSharedModule,
        MaterialModule,
        SigningRoutingModule
    ],
    declarations: [
        SigningComponent
    ],
    exports: [
        SigningComponent,
    ],
})
export class SigningModule {
}
