import { NgModule } from '@angular/core';
import { NetworkComponent } from './network.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { AppServicesModule } from '../../services/services.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        AppServicesModule,
        FlexLayoutModule,
        MaterialModule,
    ],
    declarations: [
        NetworkComponent,
    ],
    exports: [
        NetworkComponent,
    ],
})
export class NetworkModule {
}
