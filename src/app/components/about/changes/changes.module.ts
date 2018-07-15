import { NgModule } from '@angular/core';
import { ChangesComponent } from './changes.component';
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
        ChangesComponent,
    ],
    exports: [
        ChangesComponent,
    ],
})
export class ChangesModule {

}
