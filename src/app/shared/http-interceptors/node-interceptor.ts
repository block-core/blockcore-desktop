import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap, retry } from 'rxjs/operators';

@Injectable()
export class NodeInterceptor implements HttpInterceptor {
    constructor() { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        return next.handle(req)
            .pipe(retry(2)); // Make sure we at minimum always attempt 3 times, to avoid transient errors.
    }
}
