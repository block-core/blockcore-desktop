import { NgModule } from '@angular/core';
import { WalletComponent } from './wallet.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
    ],
    declarations: [
        WalletComponent,
    ],
    exports: [
        WalletComponent,
    ],
})
export class WalletModule {
}
