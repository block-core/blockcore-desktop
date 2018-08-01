import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RootComponent } from './components/root/root.component';
import { MaterialModule } from './material.module';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { DashboardModule } from './components/dashboard/dashboard.module';
import { RootModule } from './components/root/root.module';
import { NotFoundModule } from './components/not-found/not-found.module';
import { WalletModule } from './components/wallet/wallet.module';
import { SettingsModule } from './components/settings/settings.module';
import { LoginModule } from './components/login/login.module';
import { AppServicesModule } from './services/services.module';
import { LogoutModule } from './components/logout/logout.module';
import { AboutModule } from './components/about/about.module';
import { AppSharedModule } from './shared/app-shared.module';
import { APP_TITLE } from './services/title.service';
import { FormsModule } from '@angular/forms';
import { Theming } from './services/theming.service';
import { ApiService } from './services/api.service';
import { ElectronService } from 'ngx-electron';
import { GlobalService } from './services/global.service';
import { HttpModule } from '@angular/http';
import { LoadModule } from './components/load/load.module';
import { NetworkModule } from './components/network/network.module';
import { DetailsModule } from './components/details/details.module';
import { MerchantsModule } from './components/merchants/merchants.module';
import { environment } from '../environments/environment';
import { ChainService } from './services/chain.service';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    HttpClientModule,
    AppServicesModule,
    MaterialModule,
    RootModule,
    DashboardModule,
    WalletModule,
    SettingsModule,
    LoginModule,
    LogoutModule,
    AboutModule,
    AppSharedModule,
    LoadModule,
    NetworkModule,
    NotFoundModule,
    MerchantsModule,
    DetailsModule,
    AppRoutingModule,
  ],
  exports: [
    HttpModule
  ],
  providers: [
    ApiService,
    ChainService,
    ElectronService,
    GlobalService,
    { provide: APP_TITLE, useValue: 'City Hub' },
  ],
  bootstrap: [RootComponent]
})
export class AppModule {
  constructor(theming: Theming) {

    console.log(environment.environment);

    theming.start();
  }
}
