import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { ApplicationStateService } from './application-state.service';
import { TitleService } from './title.service';
import { DetailsService } from './details.service';
import { WalletService } from './wallet.service';

@NgModule({
    declarations: [

    ],
    imports: [

    ],
    providers: [AuthenticationService, ApplicationStateService, TitleService, DetailsService, WalletService]
})
export class AppServicesModule { }
