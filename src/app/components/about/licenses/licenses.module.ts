import { NgModule } from '@angular/core';
import { LicensesComponent } from './licenses.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
    ],
    declarations: [
        LicensesComponent,
    ],
    exports: [
        LicensesComponent,
    ],
})
export class LicensesModule {

}
