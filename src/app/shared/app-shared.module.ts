import { NgModule } from '@angular/core';
import { ViewAreaModule } from './view-area/view-area.module';
import { RouterLinkBack } from './directives/router-link-back.directive';
import { PasswordValidationDirective } from './directives/password-validation.directive';
import { CoinNotationPipe } from './pipes/coin-notation.pipe';
import { SizeUnitPipe } from './pipes/size-unit.pipe';
import { PriceUnitPipe } from './pipes/price-unit.pipe';
import { YesNoPipe } from './pipes/yesno.pipe';
import { SortByPipe } from './pipes/sort-by.pipe';
import { LogoModule } from './logo/logo.module';
import { BytesPipe } from './pipes/bytes.pipe';
import { GridContainerComponent } from './grid/grid-container/grid-container.component';
import { GridCellDirective } from './grid/grid-cell/grid-cell.directive';

const SHARED_DIRECTIVES = [GridCellDirective, GridContainerComponent, RouterLinkBack, PasswordValidationDirective, CoinNotationPipe, SizeUnitPipe, PriceUnitPipe, YesNoPipe, SortByPipe, BytesPipe];

@NgModule({
    declarations: [
        SHARED_DIRECTIVES
    ],
    imports: [
        ViewAreaModule,
        LogoModule
    ],
    exports: [
        ViewAreaModule,
        LogoModule,
        SHARED_DIRECTIVES
    ]
})
export class AppSharedModule {

}
