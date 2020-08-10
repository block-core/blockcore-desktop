import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { ReportComponent } from './report.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
    ],
    declarations: [
        ReportComponent,
    ],
    exports: [
        ReportComponent,
    ],
    entryComponents: [
        ReportComponent
    ],
})
export class ReportModule {
}
