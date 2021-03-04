import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { IdentityComponent } from './identity.component';
import { IdentityViewComponent } from './identity-view.component';
import { IdentityEditComponent } from './identity-edit.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ImageModule } from 'src/app/shared/image/image.module';
import { LinkAddComponent } from './link-add.component';
import { IdentityLookupComponent } from './identity-lookup.component';
import { IdentityLookupWidgetComponent } from './identity-lookup-widget.component';
import { AppSharedModule } from 'src/app/shared/app-shared.module';
import { IdentityUnlockComponent } from './identity-unlock.component';
import { IdentityExportComponent } from './identity-export.component';
import { IdentityBadgeComponent } from './identity-badge.component';
import { IdentityFilterComponent } from './identity-filter.component';
import { IdentityStateComponent } from './identity-state.component';
import { IdentityFilterPipe } from './identity-filter.pipe';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { IdentityRoutingModule } from './identity-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        MaterialModule,
        AppSharedModule,
        ImageModule,
        NgxQRCodeModule,
        IdentityRoutingModule
    ],
    declarations: [
        IdentityComponent,
        IdentityViewComponent,
        IdentityEditComponent,
        LinkAddComponent,
        IdentityLookupComponent,
        IdentityLookupWidgetComponent,
        IdentityUnlockComponent,
        IdentityExportComponent,
        IdentityBadgeComponent,
        IdentityFilterComponent,
        IdentityFilterPipe,
        IdentityStateComponent,
    ],
    exports: [
        IdentityComponent,
        IdentityViewComponent,
        IdentityEditComponent,
        IdentityLookupComponent,
        IdentityLookupWidgetComponent,
        IdentityUnlockComponent,
        IdentityExportComponent,
        IdentityBadgeComponent,
        IdentityFilterComponent,
        IdentityFilterPipe,
        IdentityStateComponent,
    ],
    entryComponents: [
        LinkAddComponent
    ]
})
export class IdentityModule {
}
