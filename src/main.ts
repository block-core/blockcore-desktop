
import { enableProdMode, ViewEncapsulation } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { BootController } from './boot';

if (environment.production) {
    enableProdMode();
}

const init = () => {
    platformBrowserDynamic().bootstrapModule(AppModule, [
        {
            // Disable global encapsulation, as it breaks many third party angular components.
            // defaultEncapsulation: ViewEncapsulation.None
        }
    ])
        .then(() => (window as any).appBootstrap && (window as any).appBootstrap())
        .catch(err => console.error('NG Bootstrap Error =>', err));
};

init();

const boot = BootController.getbootControl().watchReboot().subscribe(() => init());
