/* eslint-disable */

import { Injectable } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationStateService } from './application-state.service';
import { ChainService } from './chain.service';
import { Logger } from './logger.service';
import { HttpErrorResponse, HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { TransactionResult } from '../classes/transaction-result';
import { NotificationService } from './notification.service';
import { WalletSplit } from '@models/wallet-split';

/**
 * For information on the API specification have a look at our swagger files located at http://localhost:5000/swagger/ when running the daemon
 */
@Injectable({
    providedIn: 'root'
})
export class ApiService {
    static singletonInstance: ApiService;

    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private pollingInterval = 5000;
    private longPollingInterval = 10000;
    private daemon;

    public apiUrl: string;
    public apiVersion = 'v2.0-dev'; // This will change into "v1.0-city" in a future update to the City Chain daemon.
    public genesisDate: Date;
    public apiPort: number;

    constructor(
        private http: HttpClient,
        private globalService: GlobalService,
        private appState: ApplicationStateService,
        private log: Logger,
        private chains: ChainService,
        private electronService: ElectronService,
        private notifications: NotificationService,
        public snackBar: MatSnackBar) {

        if (!ApiService.singletonInstance) {
            ApiService.singletonInstance = this;
        }

        return ApiService.singletonInstance;
    }

    /** Initialized the daemon running in the background, by sending configuration that has been picked by user, including chain, network and mode. */
    initialize() {
        // Get the current network (main, regtest, testnet), current blockchain (city, stratis, bitcoin) and the mode (full, light, mobile)
        const chain = this.chains.getChain(this.appState.daemon.network);

        // Get the correct name of the chain that was found.
        this.appState.chain = chain.chain.toLowerCase();

        // Make sure we copy some of the state information to the chain instance supplied to launch the daemon by the main process.
        chain.mode = this.appState.daemon.mode;
        chain.path = this.appState.daemon.path;
        chain.datafolder = this.appState.daemon.datafolder;

        this.genesisDate = chain.genesisDate;

        this.log.info('Api Service, Chain: ', chain);

        // For mobile mode, we won't launch any daemons.
        if (chain.mode === 'simple') {

        } else {
            if (this.electronService.ipcRenderer) {
                this.daemon = this.electronService.ipcRenderer.sendSync('start-daemon', chain);

                if (this.daemon !== 'OK') {
                    this.notifications.add({
                        title: 'Blockcore node background error',
                        hint: 'Messages from the background process received in Blockcore Hub',
                        message: this.daemon,
                        icon: 'warning'
                        // icon: (this.daemon.indexOf('Blockcore Hub was started in development mode') > -1) ? 'build' : 'warning'
                    });
                    // this.snackBar.open(this.daemon, null, { duration: 7000 });
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

    getNodeStatus(): Observable<any> {
        const self = this;

        return this.http
            .get(self.apiUrl + '/node/status')
            .pipe(catchError(this.handleInitialError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    getNodeStatusInterval(): Observable<any> {
        const self = this;

        return interval(this.pollingInterval)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(self.apiUrl + '/node/status', { headers: self.headers })))
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    getNodeStatusCustomInterval(milliseconds: number): Observable<any> {
        const self = this;

        return interval(milliseconds)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(self.apiUrl + '/node/status', { headers: self.headers })))
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    getBannedNodesCustomInterval(milliseconds: number): Observable<any> {

        const self = this;

        return interval(milliseconds)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(self.apiUrl + '/Network/getbans', { headers: self.headers })))
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    // getAddressBookAddresses(): Observable<any> {
    //     return Observable
    //         .interval(this.pollingInterval)
    //         .startWith(0)
    //         .switchMap(() => this.http.get(this.apiUrl + '/AddressBook'))
    //         .map((response: Response) => response);
    // }

    // addAddressBookAddress(data: AddressLabel): Observable<any> {
    //     return this.http
    //         .post(this.apiUrl + '/AddressBook/address', JSON.stringify(data), { headers: this.headers })
    //         .map((response: Response) => response);
    // }

    // removeAddressBookAddress(label: string): Observable<any> {
    //     const params: URLSearchParams = new URLSearchParams();
    //     params.set('label', label);
    //     return this.http
    //         .delete(this.apiUrl + '/AddressBook/address', new RequestOptions({ headers: this.headers, params: params }))
    //         .map((response: Response) => response);
    // }

    /**
     * Gets available wallets at the default path
     */
    getWalletFiles(): Observable<any> {
        return this.http
            .get(this.apiUrl + '/wallet/files')
            .pipe(catchError(this.handleInitialError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /** Gets the extended public key from a certain wallet */
    getExtPubkey(data: WalletInfo): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: data.accountName,
            }
        });

        return this.http
            .get(this.apiUrl + '/wallet/extpubkey', { headers: this.headers, params: search })
            .pipe(catchError(this.handleError.bind(this)))
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
     * Get wallet statistics info from the API.
     */
    getWalletStatistics(data: WalletInfo): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: data.accountName,
            }
        });

        return this.http
            .get(this.apiUrl + '/wallet/wallet-stats', { headers: this.headers, params: search })
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

    /**
     * Split UTXOs in the wallet.
     */
    splitCoins(data: WalletSplit): Observable<any> {
        return this.http
            .post(this.apiUrl + '/wallet/splitcoins/', JSON.stringify(data), { headers: this.headers })
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
            .pipe(map((response: GeneralInfo) => (response) as GeneralInfo));
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
                accountName: data.accountName
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
                accountName: data.accontName,
                feeType: data.feeType,
                allowUnconfirmed: 'true'
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
                accountName: data.accountName
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
    getUnusedReceiveAddress(data: WalletInfo, addressType: string): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: data.accountName,
                segwit: (addressType === 'Segwit').toString()
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
    getFirstReceiveAddress(data: WalletInfo, addressType: string): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: data.accountName,
                segwit: (addressType === 'Segwit').toString()
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
    getUnusedReceiveAddresses(data: WalletInfo, count: string, addressType: string): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: data.accountName,
                count,
                segwit: (addressType === 'Segwit').toString()
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
    getAllAddresses(data: WalletInfo, addressType: string): Observable<any> {
        const search = new HttpParams({
            fromObject: {
                walletName: data.walletName,
                accountName: data.accountName,
                segwit: (addressType === 'Segwit').toString()
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
        // const search = new HttpParams()
        //     .set('walletName', data.walletName)
        //     .set('accountName', data.accountName)
        //     .set('recipients[0].destinationAddress', data.recipients[0].destinationAddress)
        //     .set('recipients[0].amount', data.recipients[0].amount)
        //     .set('feeType', data.feeType)
        //     .set('allowUnconfirmed', 'true');

        return this.http
            .post(this.apiUrl + '/wallet/estimate-txfee', JSON.stringify(data), { headers: this.headers })
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
    sendTransaction(data: TransactionSending): Observable<TransactionResult> {
        return this.http
            .post(this.apiUrl + '/wallet/send-transaction', JSON.stringify(data), { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: TransactionResult) => response));
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
     * Stop staking
     */
    stopStaking(): Observable<any> {
        return this.http
            .post(this.apiUrl + '/staking/stopstaking', 'true', { headers: this.headers })
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
     * Get cold staking address (for Cold or Hot addresses)
     */
    getColdStakingAddress(walletName: string, isColdWallet: boolean, segwit: boolean): Observable<any> {
        const params = new HttpParams({
            fromObject: {
                walletName: walletName,
                IsColdWalletAddress: isColdWallet.toString(),
                Segwit: segwit.toString()
            }
        });

        return this.http
            .get(this.apiUrl + '/ColdStaking/cold-staking-address', { headers: this.headers, params })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Get cold staking info
     */
    getColdStakingInfo(walletName: string): Observable<any> {
        const params = new HttpParams({
            fromObject: {
                walletName: walletName
            }
        });

        return interval(this.pollingInterval)
            .pipe(startWith(0))
            .pipe(switchMap(() => this.http.get(this.apiUrl + '/ColdStaking/cold-staking-info', { headers: this.headers, params })))
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Active the offline cold staking
     */
    setupOfflineColdStaking(wallet: string, password: string, walletAccount: string, coldWalletAddress: string, hotWalletAddress: string, amount: number, fees: number, segwitChangeAddress: boolean, payToScript: boolean): Observable<any> {
        var body = {
            "coldWalletAddress": coldWalletAddress,
            "hotWalletAddress": hotWalletAddress,
            "walletName": wallet,
            "walletPassword": password,
            "walletAccount": walletAccount,
            "amount": amount,
            "fees": fees,
            "segwitChangeAddress": segwitChangeAddress,
            "payToScript": payToScript
        };

        console.log(body);

        return this.http
            .post(this.apiUrl + '/ColdStaking/setup-offline-staking', body, { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Enable delegated staking
     */
    enableColdStaking(wallet: string, password: string, isColdWalletAccount: boolean): Observable<any> {
        return this.http
            .post(this.apiUrl + '/ColdStaking/cold-staking-account', {
                "walletName": wallet,
                "walletPassword": password,
                "isColdWalletAccount": isColdWalletAccount
            }, { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Sign a message
     */
    signMessage(wallet: string, password: string, account: string, address: string, message: string): Observable<any> {
        return this.http
            .post(this.apiUrl + '/Wallet/signmessage', {
                "walletName": wallet,
                "password": password,
                "accountName": account,
                "externalAddress": address,
                "message": message
            }, { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Verify a message
     */
    verifyMessage(address: string, message: string, signature: string): Observable<any> {
        return this.http
            .post(this.apiUrl + '/Wallet/verifymessage', {
                "signature": signature,
                "externalAddress": address,
                "message": message
            }, { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Send shutdown signal to the daemon
     */
    shutdownNode(): Observable<any> {
        return this.http
            .post(this.apiUrl + '/node/shutdown', 'true', { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Add node
     */
    addNode(ip: string): Observable<any> {
        const params = new HttpParams({
            fromObject: {
                command: 'add',
                endpoint: ip,
            }
        });

        console.log(params);

        return this.http
            .get(this.apiUrl + '/ConnectionManager/addnode', { headers: this.headers, params })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Remove node
     */
    removeNode(ip: string): Observable<any> {
        const params = new HttpParams({
            fromObject: {
                command: 'remove',
                endpoint: ip,
            }
        });

        return this.http
            .get(this.apiUrl + '/ConnectionManager/addnode', { headers: this.headers, params })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Ban node
     */
    banNode(ip: string, banDurationSeconds: number): Observable<any> {
        const cmd = {
            banCommand: 'add',
            banDurationSeconds,
            peerAddress: ip
        };

        return this.http
            .post(this.apiUrl + '/Network/setban/', JSON.stringify(cmd), { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Unban node
     */
    unbanNode(ip: string): Observable<any> {
        const cmd = {
            banCommand: 'remove',
            peerAddress: ip
        };

        return this.http
            .post(this.apiUrl + '/Network/setban/', JSON.stringify(cmd), { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /**
     * Remove all bans
     */
    removeBans(): Observable<any> {
        const cmd = {
            true: 'true'
        };

        return this.http
            .post(this.apiUrl + '/Network/clearbanned/', JSON.stringify(cmd), { headers: this.headers })
            .pipe(catchError(this.handleError.bind(this)))
            .pipe(map((response: Response) => response));
    }

    /** Use this to handle error in the initial startup (wallet/files) of Blockcore Hub. */
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
        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
            errorMessage = 'An error occurred:' + error.error.message;
            // A client-side or network error occurred. Handle it accordingly.
        } else if (error.error?.errors) {
            if (Array.isArray(error.error.errors)) {
                errorMessage = `${error.error.errors[0].message} (Code: ${error.error.errors[0].status})`;
            } else {
                for (var property in error.error?.errors) {
                    if (error.error?.errors.hasOwnProperty(property)) {
                        console.log(property);
                        errorMessage += `${property}: ${error.error.errors[property]}`;
                    }
                }
            }
        } else if (error.name === 'HttpErrorResponse') {
            errorMessage = `Unable to connect with background daemon: ${error.message} (${error.status})`;
            // if (error.error.target.__zone_symbol__xhrURL.indexOf('api/wallet/files') > -1) {
            // }
        } else {
            errorMessage = `Error: ${error.message} (${error.status})`;
        }

        this.log.error(errorMessage);

        this.notifications.add({
            title: 'Communication error',
            hint: 'These types of errors are not uncommon, happens when there is issues communicating between Blockcore Hub and Blockcore Node background process',
            message: errorMessage,
            icon: 'warning'
        });

        // if (errorMessage.indexOf('Http failure response for') === -1) {
        // this.snackBar.open(errorMessage, null, { duration: 5000, panelClass: 'error-snackbar' });
        // }
    }
}
