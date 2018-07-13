import { NgModule } from '@angular/core';
import { ViewAreaComponent } from './view-area.component';
export * from './view-area.component';

@NgModule({
    declarations: [
        ViewAreaComponent,
    ],
    exports: [
        ViewAreaComponent,
    ]
})
export class ViewAreaModule {

}
