import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable, interval } from 'rxjs';
import { map, withLatestFrom, startWith, switchMap, } from 'rxjs/operators';
import { GlobalService } from './global.service';
import { ElectronService } from 'ngx-electron';
import { WalletCreation } from '../classes/wallet-creation';
import { WalletRecovery } from '../classes/wallet-recovery';
import { WalletLoad } from '../classes/wallet-load';
import { WalletInfo } from '../classes/wallet-info';
import { Mnemonic } from '../classes/mnemonic';
import { FeeEstimation } from '../classes/fee-estimation';
import { TransactionBuilding } from '../classes/transaction-building';
import { TransactionSending } from '../classes/transaction-sending';
import { GeneralInfo } from '../classes/general-info';
import { MatSnackBar } from '@angular/material';
import { environment } from '../../environments/environment';
import { ApplicationStateService } from './application-state.service';
import { ChainService } from './chain.service';

/**
 * For information on the API specification have a look at our swagger files located at http://localhost:5000/swagger/ when running the daemon
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  static singletonInstance: ApiService;

  constructor(private http: Http,
    private globalService: GlobalService,
    private appState: ApplicationStateService,
    public snackBar: MatSnackBar,
    private chains: ChainService,
    private electronService: ElectronService) {

    if (!ApiService.singletonInstance) {
      ApiService.singletonInstance = this;
    }

    return ApiService.singletonInstance;
    
  }

  private headers = new Headers({ 'Content-Type': 'application/json' });
  private pollingInterval = 3000;
  private apiPort;
  private stratisApiUrl;
  private daemon;

  /** Initialized the daemon running in the background, by sending configuration that has been picked by user, including chain, network and mode. */
  initialize() {

    // Get the current network (main, regtest, testnet), current blockchain (city, stratis, bitcoin) and the mode (full, light, mobile)
    var chain = this.chains.getChain(this.appState.chain, this.appState.network);
    chain.mode = this.appState.mode;

    console.log(chain);

    // For mobile mode, we won't launch any daemons.
    if (chain.mode === 'mobile') {

    }
    else {
      if (this.electronService.ipcRenderer) {
        this.daemon = this.electronService.ipcRenderer.sendSync('start-daemon', chain);
        console.log('Daemon result: ', this.daemon);
        this.setApiPort(chain.apiPort);
      }
    }
  }

  setApiPort(port: number) {
    // Get the selected coin from launch parameters. If they are not available, we will use the one supplied during build,
    // to ensure that launching a test network binary, should by default connect to testnet.

    // if (environment.environment === 'TESTNET') {
    //   this.apiPort = this.coin.apiTestPort;
    // } else if (environment.environment === 'REGTEST')
    // {
    //   this.apiPort = this.coin.apiRegTestPort;  
    // }
    // else {
    //   this.apiPort = this.coin.apiPort;
    // }

    this.stratisApiUrl = 'http://localhost:' + port + '/api';
  }

  /**
   * Gets available wallets at the default path
   */
  getWalletFiles(): Observable<any> {
    return this.http
      .get(this.stratisApiUrl + '/wallet/files')
      .pipe(map((response: Response) => response));
  }

  /**
   * Get a new mnemonic
   */
  getNewMnemonic(): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('language', 'English');

    params.set('wordCount', '12');

    return this.http
      .get(this.stratisApiUrl + '/wallet/mnemonic', new RequestOptions({ headers: this.headers, search: params }))
      .pipe(map((response: Response) => response));
  }

  /**
   * Create a new Stratis wallet.
   */
  createStratisWallet(data: WalletCreation): Observable<any> {
    return this.http
      .post(this.stratisApiUrl + '/wallet/create/', JSON.stringify(data), { headers: this.headers })
      .pipe(map((response: Response) => response));
  }

  /**
   * Recover a Stratis wallet.
   */
  recoverStratisWallet(data: WalletRecovery): Observable<any> {
    return this.http
      .post(this.stratisApiUrl + '/wallet/recover/', JSON.stringify(data), { headers: this.headers })
      .pipe(map((response: Response) => response));
  }

  /**
   * Load a Stratis wallet
   */
  loadStratisWallet(data: WalletLoad): Observable<any> {
    return this.http
      .post(this.stratisApiUrl + '/wallet/load/', JSON.stringify(data), { headers: this.headers })
      .pipe(map((response: Response) => response));
  }

  /**
   * Get wallet status info from the API.
   */
  getWalletStatus(): Observable<any> {
    return this.http
      .get(this.stratisApiUrl + '/wallet/status')
      .pipe(map((response: Response) => response));
  }

  /**
   * Get general wallet info from the API once.
   */
  getGeneralInfoOnce(data: WalletInfo): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('Name', data.walletName);

    return this.http
      .get(this.stratisApiUrl + '/wallet/general-info', new RequestOptions({ headers: this.headers, search: params }))
      .pipe(map((response: Response) => response));
  }

  /**
   * Get general wallet info from the API.
   */
  getGeneralInfo(data: WalletInfo): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('Name', data.walletName);

    return interval(this.pollingInterval)
      .pipe(startWith(0))
      //.pipe(switchMap)
      //.startWith(0)
      .pipe(switchMap(() => this.http.get(this.stratisApiUrl + '/wallet/general-info', new RequestOptions({ headers: this.headers, search: params }))))
      .pipe(map((response: Response) => response));
  }

  /**
 * Get general wallet info from the API.
 */
  getGeneralInfoTyped(data: WalletInfo, pollingInterval = this.pollingInterval): Observable<GeneralInfo> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('Name', data.walletName);

    return interval(pollingInterval)
      .pipe(startWith(0))
      .pipe(switchMap(() => this.http.get(this.stratisApiUrl + '/wallet/general-info', new RequestOptions({ headers: this.headers, search: params }))))
      .pipe(map((response: Response) => <GeneralInfo>(response.json())));
  }

  /**
   * Get wallet balance info from the API.
   */
  getWalletBalance(data: WalletInfo): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('walletName', data.walletName);
    params.set('accountName', "account 0");

    return interval(this.pollingInterval)
      .pipe(startWith(0))
      .pipe(switchMap(() => this.http.get(this.stratisApiUrl + '/wallet/balance', new RequestOptions({ headers: this.headers, search: params }))))
      .pipe(map((response: Response) => response));
  }

  /**
   * Get the maximum sendable amount for a given fee from the API
   */
  getMaximumBalance(data): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('walletName', data.walletName);
    params.set('accountName', 'account 0');
    params.set('feeType', data.feeType);
    params.set('allowUnconfirmed', 'true');

    return this.http
      .get(this.stratisApiUrl + '/wallet/maxbalance', new RequestOptions({ headers: this.headers, search: params }))
      .pipe(map((response: Response) => response));
  }

  /**
   * Get a wallets transaction history info from the API.
   */
  getWalletHistory(data: WalletInfo): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('walletName', data.walletName);
    params.set('accountName', 'account 0');

    return interval(this.pollingInterval)
      .pipe(startWith(0))
      .pipe(switchMap(() => this.http.get(this.stratisApiUrl + '/wallet/history', new RequestOptions({ headers: this.headers, search: params }))))
      .pipe(map((response: Response) => response));
  }

  /**
   * Get an unused receive address for a certain wallet from the API.
   */
  getUnusedReceiveAddress(data: WalletInfo): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('walletName', data.walletName);
    params.set('accountName', "account 0"); //temporary

    return this.http
      .get(this.stratisApiUrl + '/wallet/unusedaddress', new RequestOptions({ headers: this.headers, search: params }))
      .pipe(map((response: Response) => response));
  }

  /**
   * Get multiple unused receive addresses for a certain wallet from the API.
   */
  getUnusedReceiveAddresses(data: WalletInfo, count: string): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('walletName', data.walletName);
    params.set('accountName', 'account 0'); //temporary
    params.set('count', count);

    return this.http
      .get(this.stratisApiUrl + '/wallet/unusedaddresses', new RequestOptions({ headers: this.headers, search: params }))
      .pipe(map((response: Response) => response));
  }

  /**
   * Get get all addresses for an account of a wallet from the API.
   */
  getAllAddresses(data: WalletInfo): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('walletName', data.walletName);
    params.set('accountName', 'account 0'); //temporary

    return this.http
      .get(this.stratisApiUrl + '/wallet/addresses', new RequestOptions({ headers: this.headers, search: params }))
      .pipe(map((response: Response) => response));
  }

  /**
   * Estimate the fee of a transaction
   */
  estimateFee(data: FeeEstimation): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('walletName', data.walletName);
    params.set('accountName', data.accountName);
    params.set('destinationAddress', data.destinationAddress);
    params.set('amount', data.amount);
    params.set('feeType', data.feeType);
    params.set('allowUnconfirmed', 'true');

    return this.http
      .get(this.stratisApiUrl + '/wallet/estimate-txfee', new RequestOptions({ headers: this.headers, search: params }))
      .pipe(map((response: Response) => response));
  }

  /**
   * Build a transaction
   */
  buildTransaction(data: TransactionBuilding): Observable<any> {
    return this.http
      .post(this.stratisApiUrl + '/wallet/build-transaction', JSON.stringify(data), { headers: this.headers })
      .pipe(map((response: Response) => response));
  }

  /**
   * Send transaction
   */
  sendTransaction(data: TransactionSending): Observable<any> {
    return this.http
      .post(this.stratisApiUrl + '/wallet/send-transaction', JSON.stringify(data), { headers: this.headers })
      .pipe(map((response: Response) => response));
  }

  /**
   * Start staking
   */
  startStaking(data: any): Observable<any> {
    return this.http
      .post(this.stratisApiUrl + '/miner/startstaking', JSON.stringify(data), { headers: this.headers })
      .pipe(map((response: Response) => response));
  }

  /**
   * Get staking info
   */
  getStakingInfo(): Observable<any> {
    return interval(this.pollingInterval)
      .pipe(startWith(0))
      .pipe(switchMap(() => this.http.get(this.stratisApiUrl + '/miner/getstakinginfo')))
      .pipe(map((response: Response) => response));
  }

  /**
    * Stop staking
    */
  stopStaking(): Observable<any> {
    return this.http
      .post(this.stratisApiUrl + '/miner/stopstaking', { headers: this.headers })
      .pipe(map((response: Response) => response));
  }

  /**
   * Send shutdown signal to the daemon
   */
  shutdownNode(): Observable<any> {
    return this.http
      .post(this.stratisApiUrl + '/node/shutdown', { headers: this.headers })
      .pipe(map((response: Response) => response));
  }

  handleError(error: any) {
    console.error(error);

    if (error.status >= 400) {
      if (!error.json().errors[0]) {
        console.log(error);
      } else {
        let snackBarRef = this.snackBar.open('Error: ' + error.json().errors[0].message, null, { duration: 4000 });
      }
    } else {
      let snackBarRef = this.snackBar.open('Unknown error: Network daemon might be unavailable.', null, { duration: 4000 });
    }
  }
}
