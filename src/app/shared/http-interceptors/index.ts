/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// import { AuthInterceptor } from './auth-interceptor';
// import { CachingInterceptor } from './caching-interceptor';
// import { EnsureHttpsInterceptor } from './ensure-https-interceptor';
import { LoggingInterceptor } from './logging-interceptor';
import { NodeInterceptor } from './node-interceptor';
// import { NoopInterceptor } from './noop-interceptor';
// import { TrimNameInterceptor } from './trim-name-interceptor';
// import { UploadInterceptor } from './upload-interceptor';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
    // { provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor, multi: true },

    // { provide: HTTP_INTERCEPTORS, useClass: EnsureHttpsInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: TrimNameInterceptor, multi: true },

    // { provide: HTTP_INTERCEPTORS, useClass: NodeInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },

    // { provide: HTTP_INTERCEPTORS, useClass: UploadInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },

];
