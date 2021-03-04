import { NgModule } from '@angular/core';
import { NetworkComponent } from './network.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NetworkDetailsComponent } from './network-details.component';
import { NetworkAddNodeComponent } from './network-add-node.component';
import { FormsModule } from '@angular/forms';
import { NetworkBanNodeComponent } from './network-ban-node.component';
import { NetworkRoutingModule } from './network-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FlexLayoutModule,
        MaterialModule,
        FormsModule,
        NetworkRoutingModule
    ],
    declarations: [
        NetworkComponent,
        NetworkDetailsComponent,
        NetworkAddNodeComponent,
        NetworkBanNodeComponent,
    ],
    exports: [
        NetworkComponent,
        NetworkDetailsComponent,
    ],
    entryComponents: [
        NetworkAddNodeComponent,
        NetworkBanNodeComponent
    ],
})
export class NetworkModule {
}
