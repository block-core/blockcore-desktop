import { NgModule } from '@angular/core';
import { LoadComponent } from './load.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        MaterialModule,
    ],
    declarations: [
        LoadComponent,
    ],
    exports: [
        LoadComponent,
    ],
})
export class LoadModule {
}
