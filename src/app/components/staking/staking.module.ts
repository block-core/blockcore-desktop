import { NgModule } from '@angular/core';
import { StakingComponent } from './staking.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppSharedModule } from '../../shared/app-shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StakingRoutingModule } from './staking-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        FormsModule,
        AppSharedModule,
        MaterialModule,
        StakingRoutingModule
    ],
    declarations: [
        StakingComponent
    ],
    exports: [
        StakingComponent,
    ],
})
export class StakingModule {
}
