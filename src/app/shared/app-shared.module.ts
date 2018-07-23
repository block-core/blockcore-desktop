import { NgModule } from '@angular/core';
import { ViewAreaModule } from './view-area/view-area.module';
import { RouterLinkBack } from './directives/router-link-back.directive';
import { PasswordValidationDirective } from './directives/password-validation.directive';

const SHARED_DIRECTIVES = [RouterLinkBack, PasswordValidationDirective];

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
