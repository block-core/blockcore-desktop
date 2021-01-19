import { Injectable } from '@angular/core';
import { Observable, interval, throwError } from 'rxjs';
import { map, startWith, switchMap, catchError, } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationStateService } from './application-state.service';
import { Logger } from './logger.service';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class CoinService {

    private pollingInterval = 60000 * 5;
    private apiUrl = 'https://insight.city-chain.org/';

    constructor(
        private http: HttpClient,
        public appState: ApplicationStateService,
        private notifications: NotificationService,
        private log: Logger,
        public snackBar: MatSnackBar) {

    }

    getTicker(ticker: string): Observable<any> {
        return interval(this.pollingInterval)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(this.apiUrl + 'api/market/' + ticker)))
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /** Use this to handle error (exceptions) that happens in RXJS pipes. This handler will rethrow the error. */
    handleError(error: HttpErrorResponse | any) {
        this.handleException(error);
        return throwError(error);
    }

    /** Use this to handle errors (exceptions) that happens outside of an RXJS pipe. See the "handleError" for pipeline error handling. */
    handleException(error: HttpErrorResponse | any) {
        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
            errorMessage = 'An error occurred:' + error.error.message;
            // A client-side or network error occurred. Handle it accordingly.
        } else if (error.error?.errors) {
            errorMessage = `${error.error.errors[0].message} (Code: ${error.error.errors[0].status})`;
        } else if (error.name === 'HttpErrorResponse') {
            errorMessage = `Unable to connect with background daemon: ${error.message} (${error.status})`;
            // if (error.error.target.__zone_symbol__xhrURL.indexOf('api/wallet/files') > -1) {
            // }
        } else {
            errorMessage = `Error: ${error.message} (${error.status})`;
        }

        this.log.error(errorMessage);

        this.notifications.add({
            title: 'Coin ticker communication issue',
            hint: 'p2pb2b is our provider of exchange rates, and this notification indicates issues with this integration',
            message: errorMessage,
            icon: 'warning'
        });

        // if (errorMessage.indexOf('Http failure response for') === -1) {
        // this.snackBar.open(errorMessage, null, { duration: 5000, panelClass: 'error-snackbar' });
        // }
    }
}
