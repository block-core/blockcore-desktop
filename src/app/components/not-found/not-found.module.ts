import { NgModule } from '@angular/core';
import { NotFoundComponent } from './not-found.component';
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
        NotFoundComponent,
    ],
    exports: [
        NotFoundComponent,
    ],
})
export class NotFoundModule {
}
