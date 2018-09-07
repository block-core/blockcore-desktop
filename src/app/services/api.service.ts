import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable, interval, throwError } from 'rxjs';
import { map, startWith, switchMap, catchError, } from 'rxjs/operators';
import { GlobalService } from './global.service';
import { ElectronService } from 'ngx-electron';
import { WalletCreation } from '../classes/wallet-creation';
import { WalletRecovery } from '../classes/wallet-recovery';
import { WalletLoad } from '../classes/wallet-load';
import { WalletInfo } from '../classes/wallet-info';
import { FeeEstimation } from '../classes/fee-estimation';
import { TransactionBuilding } from '../classes/transaction-building';
import { TransactionSending } from '../classes/transaction-sending';
import { GeneralInfo } from '../classes/general-info';
import { MatSnackBar } from '@angular/material';
import { environment } from '../../environments/environment';
import { ApplicationStateService } from './application-state.service';
import { ChainService } from './chain.service';
import { Logger } from './logger.service';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * For information on the API specification have a look at our swagger files located at http://localhost:5000/swagger/ when running the daemon
 */
@Injectable({
    providedIn: 'root'
})
export class ApiService {

    static singletonInstance: ApiService;

    private headers = new Headers({ 'Content-Type': 'application/json' });
    private pollingInterval = 3000;
    private daemon;

    public apiUrl: string;
    public genesisDate: Date;
    public apiPort: number;

    constructor(private http: Http,
        private globalService: GlobalService,
        private appState: ApplicationStateService,
        private log: Logger,
        private chains: ChainService,
        private electronService: ElectronService,
        public snackBar: MatSnackBar) {

        if (!ApiService.singletonInstance) {
            ApiService.singletonInstance = this;
        }

        return ApiService.singletonInstance;
    }

    /** Initialized the daemon running in the background, by sending configuration that has been picked by user, including chain, network and mode. */
    initialize() {
        // Get the current network (main, regtest, testnet), current blockchain (city, stratis, bitcoin) and the mode (full, light, mobile)
        const chain = this.chains.getChain(this.appState.chain, this.appState.network);
        chain.mode = this.appState.mode;
        this.genesisDate = chain.genesisDate;

        this.log.info('Api Service, Chain: ', chain);

        // For mobile mode, we won't launch any daemons.
        if (chain.mode === 'mobile') {

        } else {
            if (this.electronService.ipcRenderer) {
                this.daemon = this.electronService.ipcRenderer.sendSync('start-daemon', chain);

                if (this.daemon !== 'OK') {
                    this.snackBar.open(this.daemon, null, { duration: 10000 });
                }

                this.log.info('Daemon result: ', this.daemon);
                this.setApiPort(chain.apiPort);
            }
        }
    }

    /** Set the API port to connect with full node API. This will differ depending on coin and network. */
    setApiPort(port: number) {
        this.apiPort = port;
        this.apiUrl = 'http://localhost:' + port + '/api';
    }

    /**
     * Gets available wallets at the default path
     */
    getWalletFiles(): Observable<any> {
        return this.http
            .get(this.apiUrl + '/wallet/files')
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get a new mnemonic
     */
    getNewMnemonic(): Observable<any> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('language', 'English');

        params.set('wordCount', '12');

        return this.http
            .get(this.apiUrl + '/wallet/mnemonic', new RequestOptions({ headers: this.headers, search: params }))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Create a new wallet.
     */
    createWallet(data: WalletCreation): Observable<any> {
        return this.http
            .post(this.apiUrl + '/wallet/create/', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Recover a wallet.
     */
    recoverWallet(data: WalletRecovery): Observable<any> {
        return this.http
            .post(this.apiUrl + '/wallet/recover/', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Load a wallet
     */
    loadWallet(data: WalletLoad): Observable<any> {
        return this.http
            .post(this.apiUrl + '/wallet/load/', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get wallet status info from the API.
     */
    getWalletStatus(): Observable<any> {
        return this.http
            .get(this.apiUrl + '/wallet/status')
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get general wallet info from the API once.
     */
    getGeneralInfoOnce(data: WalletInfo): Observable<any> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('Name', data.walletName);

        return this.http
            .get(this.apiUrl + '/wallet/general-info', new RequestOptions({ headers: this.headers, search: params }))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
    * Get general wallet info from the API once.
    */
    getGeneralInfoOnceTyped(data: WalletInfo): Observable<GeneralInfo> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('Name', data.walletName);

        return this.http
            .get(this.apiUrl + '/wallet/general-info', new RequestOptions({ headers: this.headers, search: params }))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => <GeneralInfo>(response.json())));
    }

    /**
     * Get general wallet info from the API.
     */
    getGeneralInfo(data: WalletInfo): Observable<any> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('Name', data.walletName);

        return interval(this.pollingInterval)
            .pipe(startWith(0))
            // .pipe(switchMap)
            // .startWith(0)
            .pipe(switchMap(() => this.http.get(this.apiUrl + '/wallet/general-info', new RequestOptions({ headers: this.headers, search: params }))))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
   * Get general wallet info from the API.
   */
    getGeneralInfoTyped(data: WalletInfo, pollingInterval = this.pollingInterval): Observable<GeneralInfo> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('Name', data.walletName);

        return interval(pollingInterval)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(this.apiUrl + '/wallet/general-info', new RequestOptions({ headers: this.headers, search: params }))))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => <GeneralInfo>(response.json())));
    }

    /**
     * Get wallet balance info from the API.
     */
    getWalletBalance(data: WalletInfo): Observable<any> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('walletName', data.walletName);
        params.set('accountName', 'account 0');

        return interval(this.pollingInterval)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(this.apiUrl + '/wallet/balance', new RequestOptions({ headers: this.headers, search: params }))))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get the maximum sendable amount for a given fee from the API
     */
    getMaximumBalance(data): Observable<any> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('walletName', data.walletName);
        params.set('accountName', 'account 0');
        params.set('feeType', data.feeType);
        params.set('allowUnconfirmed', 'true');

        return this.http
            .get(this.apiUrl + '/wallet/maxbalance', new RequestOptions({ headers: this.headers, search: params }))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get a wallets transaction history info from the API.
     */
    getWalletHistory(data: WalletInfo): Observable<any> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('walletName', data.walletName);
        params.set('accountName', 'account 0');

        return interval(this.pollingInterval)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(this.apiUrl + '/wallet/history', new RequestOptions({ headers: this.headers, search: params }))))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get an unused receive address for a certain wallet from the API.
     */
    getUnusedReceiveAddress(data: WalletInfo): Observable<any> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('walletName', data.walletName);
        params.set('accountName', 'account 0'); // temporary

        return this.http
            .get(this.apiUrl + '/wallet/unusedaddress', new RequestOptions({ headers: this.headers, search: params }))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
   * Get an unused receive address for a certain wallet from the API.
   */
    getFirstReceiveAddress(data: WalletInfo): Observable<any> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('walletName', data.walletName);
        params.set('accountName', 'account 0'); // temporary

        return this.http
            .get(this.apiUrl + '/wallet/firstaddress', new RequestOptions({ headers: this.headers, search: params }))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get multiple unused receive addresses for a certain wallet from the API.
     */
    getUnusedReceiveAddresses(data: WalletInfo, count: string): Observable<any> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('walletName', data.walletName);
        params.set('accountName', 'account 0'); // temporary
        params.set('count', count);

        return this.http
            .get(this.apiUrl + '/wallet/unusedaddresses', new RequestOptions({ headers: this.headers, search: params }))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get get all addresses for an account of a wallet from the API.
     */
    getAllAddresses(data: WalletInfo): Observable<any> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('walletName', data.walletName);
        params.set('accountName', 'account 0'); // temporary

        return this.http
            .get(this.apiUrl + '/wallet/addresses', new RequestOptions({ headers: this.headers, search: params }))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Estimate the fee of a transaction
     */
    estimateFee(data: FeeEstimation): Observable<any> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('walletName', data.walletName);
        params.set('accountName', data.accountName);
        params.set('destinationAddress', data.destinationAddress);
        params.set('amount', data.amount);
        params.set('feeType', data.feeType);
        params.set('allowUnconfirmed', 'true');

        return this.http
            .get(this.apiUrl + '/wallet/estimate-txfee', new RequestOptions({ headers: this.headers, search: params }))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Build a transaction
     */
    buildTransaction(data: TransactionBuilding): Observable<any> {
        return this.http
            .post(this.apiUrl + '/wallet/build-transaction', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Send transaction
     */
    sendTransaction(data: TransactionSending): Observable<any> {
        return this.http
            .post(this.apiUrl + '/wallet/send-transaction', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Start staking
     */
    startStaking(data: any): Observable<any> {
        return this.http
            .post(this.apiUrl + '/staking/startstaking', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get staking info
     */
    getStakingInfo(): Observable<any> {
        return interval(this.pollingInterval)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(this.apiUrl + '/staking/getstakinginfo')))
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
      * Stop staking
      */
    stopStaking(): Observable<any> {
        return this.http
            .post(this.apiUrl + '/staking/stopstaking', { headers: this.headers })
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    /**
     * Send shutdown signal to the daemon
     */
    shutdownNode(): Observable<any> {
        return this.http
            .post(this.apiUrl + '/node/shutdown', { headers: this.headers })
            .pipe(catchError(this.handleError))
            .pipe(map((response: Response) => response));
    }

    // private handleError(error: HttpErrorResponse | any) {
    //   if (error.error instanceof ErrorEvent) {
    //     // A client-side or network error occurred. Handle it accordingly.
    //     this.log.error('An error occurred:', error.error.message);
    //   } else {
    //     // The backend returned an unsuccessful response code.
    //     // The response body may contain clues as to what went wrong,
    //     this.log.error(
    //       `Backend returned code ${error.status}, ` +
    //       `body was: ${error.errors}`);
    //   }
    //   // return an observable with a user-facing error message
    //   return throwError('Something bad happened; please try again later.');
    // };
    handleError(error: HttpErrorResponse | any) {
        if (this.log == null) {
            console.error(error);
            return throwError('Something bad happened; please try again later.');
        }

        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
            errorMessage = 'An error occurred:' + error.error.message;
            // A client-side or network error occurred. Handle it accordingly.
        } else {
            errorMessage = `Backend returned code ${error.status}, ` +
                `body was: ${error.errors}`;
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
        }

        this.log.error(errorMessage);

        //   if (error.status === 0) {
        //     // this.cancelSubscriptions();
        //     // this.genericModalService.openModal(null, null);
        // } else if (error.status >= 400) {
        //     if (!error.json().errors[0]) {
        //         console.log(error);
        //     } else {
        //         if (error.json().errors[0].description) {
        //             // this.genericModalService.openModal(null, error.json().errors[0].message);
        //         } else {
        //             // this.cancelSubscriptions();
        //             // this.startSubscriptions();
        //         }
        //     }
        // }

        this.snackBar.open(errorMessage, null, { duration: 4000 });
        // this.snackBar.open('Unknown error: Network daemon might be unavailable.', null, { duration: 4000 });

        //   if (error.status >= 400) {
        //     if (!error.json().errors[0]) {
        //       //console.log(error);
        //     } else {
        //       let snackBarRef = this.snackBar.open('Error: ' + error.json().errors[0].message, null, { duration: 4000 });
        //     }
        //   } else {
        //     let snackBarRef = this.snackBar.open('Unknown error: Network daemon might be unavailable.', null, { duration: 4000 });
        //   }

        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
    }

    // handleError(error: HttpErrorResponse | any) {
    //   this.log.error('HTTP API failure:', error);

    //   if (error.error instanceof ErrorEvent) {
    //     // A client-side or network error occurred. Handle it accordingly.
    //     this.log.error('An error occurred:', error.error.message);
    //   } else {
    //     // The backend returned an unsuccessful response code.
    //     // The response body may contain clues as to what went wrong,
    //     this.log.error(
    //       `Backend returned code ${error.status}, ` +
    //       `body was: ${error.errors}`);
    //   }

    //   if (error.status >= 400) {
    //     if (!error.json().errors[0]) {
    //       //console.log(error);
    //     } else {
    //       let snackBarRef = this.snackBar.open('Error: ' + error.json().errors[0].message, null, { duration: 4000 });
    //     }
    //   } else {
    //     let snackBarRef = this.snackBar.open('Unknown error: Network daemon might be unavailable.', null, { duration: 4000 });
    //   }
    // }
}
