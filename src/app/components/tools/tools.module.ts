import { NgModule } from '@angular/core';
import { ToolsComponent } from './tools.component';
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
        ToolsComponent,
    ],
    exports: [
        ToolsComponent,
    ],
})
export class ToolsModule {
}
