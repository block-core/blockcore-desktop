import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RootComponent } from './components/root/root.component';
import { MaterialModule } from './material.module';
import {HttpClientModule} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { DashboardModule } from './components/dashboard/dashboard.module';
import { RootModule} from './components/root/root.module';
import { NotFoundModule } from './components/not-found/not-found.module';
import { WalletModule } from './components/wallet/wallet.module';
import { SettingsModule } from './components/settings/settings.module';
import { LoginModule } from './components/login/login.module';
import { AppServicesModule } from './services/services.module';
import { LogoutModule } from './components/logout/logout.module';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppServicesModule,
    MaterialModule,
    RootModule,
    DashboardModule,
    WalletModule,
    SettingsModule,
    LoginModule,
    LogoutModule,
    NotFoundModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [RootComponent]
})
export class AppModule { }
