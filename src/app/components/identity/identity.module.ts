import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { IdentityComponent } from './identity.component';
import { IdentityDetailsComponent } from './identity-details.component';
import { IdentityEditComponent } from './identity-edit.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ImageModule } from 'src/app/shared/image/image.module';
import { LinkAddComponent } from './link-add.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        MaterialModule,
        ImageModule,
    ],
    declarations: [
        IdentityComponent,
        IdentityDetailsComponent,
        IdentityEditComponent,
        LinkAddComponent
    ],
    exports: [
        IdentityComponent,
        IdentityDetailsComponent,
        IdentityEditComponent
    ],
    entryComponents: [
        LinkAddComponent
    ]
})
export class IdentityModule {
}
