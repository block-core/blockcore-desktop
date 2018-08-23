import { NgModule } from '@angular/core';
import { NetworkComponent } from './network.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
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
