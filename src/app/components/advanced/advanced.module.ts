import { NgModule } from '@angular/core';
import { AdvancedComponent } from './advanced.component';
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
        AdvancedComponent,
    ],
    exports: [
        AdvancedComponent,
    ],
})
export class AdvancedModule {
}
