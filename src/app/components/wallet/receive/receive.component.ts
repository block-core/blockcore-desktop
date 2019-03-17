import { Component, HostBinding, OnDestroy, ViewEncapsulation, OnInit } from '@angular/core';
import { ApplicationStateService } from '../../../services/application-state.service';
import { ApiService } from '../../../services/api.service';
import { GlobalService } from '../../../services/global.service';
import { WalletInfo } from '../../../classes/wallet-info';
import { MatSnackBar } from '@angular/material';
import { WalletService } from '../../../services/wallet.service';
import { Logger } from '../../../services/logger.service';
import * as bip32 from 'bip32';

// For future use when PRs are merged and published:
import * as city from 'city-lib';
import * as coininfo from 'city-coininfo';

@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ReceiveComponent implements OnInit, OnDestroy {
    @HostBinding('class.receive') hostClass = true;

    public address: any = '';
    public qrString: any;
    public copied = false;
    public showAll = false;
    public allAddresses: any;
    public usedAddresses: string[];
    public unusedAddresses: string[];
    public changeAddresses: string[];
    private errorMessage: string;

    constructor(
        public readonly appState: ApplicationStateService,
        public wallet: WalletService,
        public snackBar: MatSnackBar,
        private apiService: ApiService,
        private log: Logger,
        private globalService: GlobalService) {

        this.appState.pageMode = true;

    }

    ngOnInit() {
        if (this.wallet.isMultiAddressMode) {
            this.getUnusedReceiveAddress();
        } else {
            this.getFirstReceiveAddress();
        }
    }

    ngOnDestroy() {
        this.appState.pageMode = false;
    }

    public onCopiedClick() {
        this.snackBar.open('Your address has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }

    public showAllAddresses() {
        this.getAddresses();
        this.showAll = true;
    }

    public showOneAddress() {
        this.getUnusedReceiveAddress();
        this.showAll = false;
    }

    private getFirstReceiveAddress() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());

        this.apiService.getFirstReceiveAddress(walletInfo)
            .subscribe(
                response => {
                    this.address = response;
                    this.qrString = 'city:' + response;
                },
                error => {
                    this.log.error('Failed to get first receive address:', error);
                }
            );
    }

    private getAddress(node, network) {
        return city.payments.p2pkh({ pubkey: node.publicKey, network }).address;
    }

    private getUnusedReceiveAddress() {
        if (this.appState.localMode) {
            this.getUnusedReceiveAddressLocal();
        } else {
            this.getUnusedReceiveAddressApi();
        }
    }

    private getUnusedReceiveAddressLocal() {
        const network = this.appState.networkDefinition;

        const xpubkey = this.wallet.activeWallet.extPubKey;
        const root = bip32.fromBase58(xpubkey);

        // TODO: Find the last used indexed from querying indexer (persisted to IndexedDB locally)
        const address0 = this.getAddress(root.derivePath('0/0'), network);

        const address = address0;
        this.address = address;
        this.qrString = 'city:' + address;
    }

    private getUnusedReceiveAddressApi() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());

        this.apiService.getUnusedReceiveAddress(walletInfo)
            .subscribe(
                response => {
                    this.address = response;
                    this.qrString = 'city:' + response;
                },
                error => {
                    this.log.error('Failed to get unused receive address:', error);
                }
            );
    }

    private getAddresses() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());

        this.apiService.getAllAddresses(walletInfo)
            .subscribe(
                response => {
                    // if (response.status >= 200 && response.status < 400) {
                    this.allAddresses = [];
                    this.usedAddresses = [];
                    this.unusedAddresses = [];
                    this.changeAddresses = [];
                    this.allAddresses = response.addresses;

                    for (const address of this.allAddresses) {
                        if (address.isUsed) {
                            this.usedAddresses.push(address.address);
                        } else if (address.isChange) {
                            this.changeAddresses.push(address.address);
                        } else {
                            this.unusedAddresses.push(address.address);
                        }
                    }
                    // }
                },
                error => {
                    this.log.error('Failed to get addresses:', error);

                    // if (error.status === 0) {
                    //     // this.genericModalService.openModal(null, null);
                    // } else if (error.status >= 400) {
                    //     if (!error.json().errors[0]) {
                    //         console.log(error);
                    //     } else {
                    //         // this.genericModalService.openModal(null, error.json().errors[0].message);
                    //     }
                    // }
                }
            );
    }
}
