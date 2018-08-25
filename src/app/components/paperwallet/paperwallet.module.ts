import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { PaperWalletComponent } from './paperwallet.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
    ],
    declarations: [
        PaperWalletComponent,
    ],
    exports: [
        PaperWalletComponent,
    ],
})
export class PaperWalletModule {
}
