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
import { LoginModule } from './components/login/login.module';
import { AppSharedModule } from './shared/app-shared.module';
import { APP_TITLE } from './services/title.service';
import { FormsModule } from '@angular/forms';
import { Theming } from './services/theming.service';
import { ElectronService } from 'ngx-electron';
import { LoadModule } from './components/load/load.module';
import { DetailsModule } from './components/details/details.module';
import { MerchantsModule } from './components/merchants/merchants.module';
import { environment } from '../environments/environment';
import { Logger } from './services/logger.service';
import { PaperWalletModule } from './components/paperwallet/paperwallet.module';
import { httpInterceptorProviders } from './shared/http-interceptors';
import { HttpErrorHandler } from './services/http-error-handler.service';
import { ReportModule } from './components/report/report.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    declarations: [
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        MaterialModule,
        RootModule,
        DashboardModule,
        LoginModule,
        AppSharedModule,
        LoadModule,
        NotFoundModule,
        ReportModule,
        MerchantsModule,
        DetailsModule,
        PaperWalletModule,
        AppRoutingModule,
        FlexLayoutModule,
    ],
    exports: [
    ],
    providers: [
        HttpErrorHandler,
        httpInterceptorProviders,
        // ApiService,
        // HubService,
        // ChainService,
        ElectronService,
        // GlobalService,
        { provide: APP_TITLE, useValue: 'City Hub' },
    ],
    bootstrap: [RootComponent]
})
export class AppModule {
    constructor(theming: Theming, log: Logger) {
        log.info('Environment: ' + environment.environment);
        theming.start();
    }
}
