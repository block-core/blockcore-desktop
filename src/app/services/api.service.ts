import { Injectable } from '@angular/core';
import { Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable, interval, throwError, empty } from 'rxjs';
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
import { HttpErrorResponse, HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

/**
 * For information on the API specification have a look at our swagger files located at http://localhost:5000/swagger/ when running the daemon
 */
@Injectable({
    providedIn: 'root'
})
export class ApiService {
    static singletonInstance: ApiService;

    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private pollingInterval = 3000;
    private longPollingInterval = 6000;
    private daemon;

    public apiUrl: string;
    public genesisDate: Date;
    public apiPort: number;

    constructor(private http: HttpClient,
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

        // Get the correct name of the chain that was found.
        this.appState.chain = chain.identity;

        chain.mode = this.appState.mode;
        this.genesisDate = chain.genesisDate;

        this.log.info('Api Service, Chain: ', chain);

        // For mobile mode, we won't launch any daemons.
        if (chain.mode === 'mobile') {

        } else {
            if (this.electronService.ipcRenderer) {
                this.daemon = this.electronService.ipcRenderer.sendSync('start-daemon', chain);

                if (this.daemon !== 'OK') {
                    this.snackBar.open(this.daemon, null, { duration: 7000 });
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
            .pipe(catchError(this.handleInitialError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get a new mnemonic
     */
    getNewMnemonic(): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                language: 'English',
                wordCount: '12',
            }
        });

        return this.http
            .get(this.apiUrl + '/wallet/mnemonic', { headers: this.headers, params: search })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Create a new wallet.
     */
    createWallet(data: WalletCreation): Observable<any> {
        return this.http
            .post(this.apiUrl + '/wallet/create/', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Recover a wallet.
     */
    recoverWallet(data: WalletRecovery): Observable<any> {
        return this.http
            .post(this.apiUrl + '/wallet/recover/', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Load a wallet.
     */
    loadWallet(data: WalletLoad): Observable<any> {
        return this.http
            .post(this.apiUrl + '/wallet/load/', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get wallet status info from the API.
     */
    getWalletStatus(): Observable<any> {
        return this.http
            .get(this.apiUrl + '/wallet/status')
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /** Remove wallet history and perform a new sync. */
    removeHistory(walletName: string): Observable<any> {
        return this.http
            .delete(this.apiUrl + '/wallet/remove-transactions/?all=true&reSync=true&walletName=' + walletName, { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get general wallet info from the API once.
     */
    getGeneralInfoOnce(data: WalletInfo): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                Name: data.walletName
            }
        });

        return this.http
            .get(this.apiUrl + '/wallet/general-info', { headers: this.headers, params: search })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
    * Get general wallet info from the API once.
    */
    getGeneralInfoOnceTyped(data: WalletInfo): Observable<GeneralInfo> {
        const search = new HttpParams({
            fromObject: {
                Name: data.walletName
            }
        });

        return this.http
            .get(this.apiUrl + '/wallet/general-info', { headers: this.headers, params: search })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: GeneralInfo) => <GeneralInfo>(response)));
    }

    /**
     * Get general wallet info from the API.
     */
    getGeneralInfo(data: WalletInfo): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                Name: data.walletName
            }
        });

        return interval(this.pollingInterval)
            .pipe(startWith(0))
            // .pipe(switchMap)
            // .startWith(0)
            .pipe(switchMap(() => this.http.get(this.apiUrl + '/wallet/general-info', { headers: this.headers, params: search })))
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
   * Get general wallet info from the API.
   */
    getGeneralInfoTyped(data: WalletInfo, pollingInterval = this.pollingInterval): Observable<GeneralInfo> {
        const search = new HttpParams({
            fromObject: {
                Name: data.walletName
            }
        });

        return interval(pollingInterval)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(this.apiUrl + '/wallet/general-info', { headers: this.headers, params: search })))
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: GeneralInfo) => response));
    }

    /**
     * Get wallet balance info from the API.
     */
    getWalletBalance(data: WalletInfo): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: 'account 0'
            }
        });

        return interval(this.pollingInterval)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(this.apiUrl + '/wallet/balance', { headers: this.headers, params: search })))
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get the maximum sendable amount for a given fee from the API
     */
    getMaximumBalance(data): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: 'account 0',
                feeType: data.feeType,
                allowUnconfirmed: 'false'
            }
        });

        return this.http
            .get(this.apiUrl + '/wallet/maxbalance', { headers: this.headers, params: search })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get a wallets transaction history info from the API.
     */
    getWalletHistory(data: WalletInfo): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: 'account 0'
            }
        });

        return interval(this.longPollingInterval)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(this.apiUrl + '/wallet/history', { headers: this.headers, params: search })))
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get an unused receive address for a certain wallet from the API.
     */
    getUnusedReceiveAddress(data: WalletInfo): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: 'account 0'
            }
        });

        return this.http
            .get(this.apiUrl + '/wallet/unusedaddress', { headers: this.headers, params: search })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
   * Get an unused receive address for a certain wallet from the API.
   */
    getFirstReceiveAddress(data: WalletInfo): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: 'account 0'
            }
        });

        return this.http
            .get(this.apiUrl + '/wallet/firstaddress', { headers: this.headers, params: search })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get multiple unused receive addresses for a certain wallet from the API.
     */
    getUnusedReceiveAddresses(data: WalletInfo, count: string): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: 'account 0',
                count: count
            }
        });

        return this.http
            .get(this.apiUrl + '/wallet/unusedaddresses', { headers: this.headers, params: search })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get get all addresses for an account of a wallet from the API.
     */
    getAllAddresses(data: WalletInfo): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: 'account 0'
            }
        });

        return this.http
            .get(this.apiUrl + '/wallet/addresses', { headers: this.headers, params: search })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Estimate the fee of a transaction
     */
    estimateFee(data: FeeEstimation): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: data.accountName,
                destinationAddress: data.destinationAddress,
                amount: data.amount,
                feeType: data.feeType,
                allowUnconfirmed: 'false'
            }
        });

        return this.http
            .get(this.apiUrl + '/wallet/estimate-txfee', { headers: this.headers, params: search })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Build a transaction
     */
    buildTransaction(data: TransactionBuilding): Observable<any> {
        return this.http
            .post(this.apiUrl + '/wallet/build-transaction', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Send transaction
     */
    sendTransaction(data: TransactionSending): Observable<any> {
        return this.http
            .post(this.apiUrl + '/wallet/send-transaction', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Start staking
     */
    startStaking(data: any): Observable<any> {
        return this.http
            .post(this.apiUrl + '/staking/startstaking', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get staking info
     */
    getStakingInfo(): Observable<any> {
        return interval(this.pollingInterval)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(this.apiUrl + '/staking/getstakinginfo')))
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
      * Stop staking
      */
    stopStaking(): Observable<any> {
        return this.http
            .post(this.apiUrl + '/staking/stopstaking', { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Send shutdown signal to the daemon
     */
    shutdownNode(): Observable<any> {
        return this.http
            .post(this.apiUrl + '/node/shutdown', { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /** Use this to handle error in the initial startup (wallet/files) of City Hub. */
    handleInitialError(error: HttpErrorResponse | any) {
        // Only show snackbar errors when we have connected. Initially we will receive some errors due to aggresive
        // attempts at connecting to the node.
        if (this.appState.connected) {
            this.handleException(error);
        }

        return throwError(error);
    }

    /** Use this to handle error (exceptions) that happens in RXJS pipes. This handler will rethrow the error. */
    handleError(error: HttpErrorResponse | any) {
        this.handleException(error);
        return throwError(error);
    }

    /** Use this to handle errors (exceptions) that happens outside of an RXJS pipe. See the "handleError" for pipeline error handling. */
    handleException(error: HttpErrorResponse | any) {

        // tslint:disable-next-line:no-debugger
        debugger;

        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
            errorMessage = 'An error occurred:' + error.error.message;
            // A client-side or network error occurred. Handle it accordingly.
        } else if (error.error.errors) {
            errorMessage = `${error.error.errors[0].message} (Code: ${error.error.errors[0].status})`;
        } else if (error.name === 'HttpErrorResponse') {
            errorMessage = `Unable to connect with background daemon: ${error.message} (${error.status})`;
            // if (error.error.target.__zone_symbol__xhrURL.indexOf('api/wallet/files') > -1) {
            // }
        } else {
            errorMessage = `Error: ${error.message} (${error.status})`;
        }

        this.log.error(errorMessage);

        // if (errorMessage.indexOf('Http failure response for') === -1) {
        this.snackBar.open(errorMessage, null, { duration: 5000, panelClass: 'error-snackbar' });
        // }
    }
}
