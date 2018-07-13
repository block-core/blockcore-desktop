import { NgModule } from '@angular/core';
import { ViewAreaModule } from './view-area/view-area.module';
import { RouterLinkBack } from './directives/router-link-back.directive';

const SHARED_DIRECTIVES = [RouterLinkBack];

@NgModule({
    declarations: [
        SHARED_DIRECTIVES
    ],
    imports: [
        ViewAreaModule
    ],
    exports: [
        ViewAreaModule,
        SHARED_DIRECTIVES
    ]
})
export class AppSharedModule {

}
