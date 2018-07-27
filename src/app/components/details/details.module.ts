import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { DetailsComponent } from './details.component';
import { AppSharedModule } from '../../shared/app-shared.module';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        AppSharedModule,
        ClipboardModule,
        MaterialModule,
    ],
    declarations: [
        DetailsComponent,
    ],
    exports: [
        DetailsComponent,
    ],
})
export class DetailsModule {
}
