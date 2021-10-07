/* eslint-disable */

import { Component, HostBinding, OnDestroy, ViewEncapsulation, OnInit } from '@angular/core';
import { ApplicationStateService } from '../../../services/application-state.service';
import { ApiService } from '../../../services/api.service';
import { GlobalService } from '../../../services/global.service';
import { WalletInfo } from '../../../classes/wallet-info';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WalletService } from '../../../services/wallet.service';
import { Logger } from '../../../services/logger.service';
import * as bip32 from 'bip32';
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
    public addressType: string;

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
        // Read the user picked address type.
        this.addressType = this.appState.addressType;

        this.load();
    }

    load() {
        if (this.showAll) {
            if (this.appState.isSimpleMode) {
                this.getAddressesSimpleMode();
            } else {
                this.getAddressesFullNode();
            }
        }
        else {
            if (this.wallet.isMultiAddressMode) {
                this.getUnusedReceiveAddress();
            } else {
                this.getFirstReceiveAddress();
            }
        }
    }

    ngOnDestroy() {
        this.appState.pageMode = false;
    }

    public onCopiedClick() {
        this.snackBar.open('Your address has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }

    public onAddressTypeChange(event) {
        this.addressType = event.value;
        this.load();
    }

    public showAllAddresses() {
        if (this.appState.isSimpleMode) {
            this.getAddressesSimpleMode();
        } else {
            this.getAddressesFullNode();
        }

        this.showAll = true;
    }

    public showOneAddress() {
        this.getUnusedReceiveAddress();
        this.showAll = false;
    }

    private getFirstReceiveAddress() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());

        this.apiService.getFirstReceiveAddress(walletInfo, this.addressType)
            .subscribe(
                response => {
                    this.address = response;
                    // this.qrString = 'city:' + response;
                    this.qrString = response; // To be compatible with mobile wallet (copay-based), we won't use prefix.
                },
                error => {
                    this.log.error('Failed to get first receive address:', error);
                }
            )
            ;
    }

    private getUnusedReceiveAddress() {
        if (this.appState.isSimpleMode) {
            this.getUnusedReceiveAddressSimpleMode();
        } else {
            this.getUnusedReceiveAddressFullNode();
        }
    }

    private getUnusedReceiveAddressSimpleMode() {
        const network = this.appState.networkDefinition;
        const xpubkey = this.wallet.activeWallet.extPubKey;
        const root = bip32.fromBase58(xpubkey);

        // TODO: Find the last used indexed from querying indexer (persisted to IndexedDB locally)
        const address0 = this.getAddress(root.derivePath('0/0'), network);

        const address = address0;
        this.address = address;
        // this.qrString = 'city:' + address;
        this.qrString = address; // To be compatible with mobile wallet (copay-based), we won't use prefix.
    }

    private getAddress(node, network) {
        const p2pkh = city.payments.p2pkh({ pubkey: node.publicKey, network });
        return p2pkh.address;
    }

    private getUnusedReceiveAddressFullNode() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());

        this.apiService.getUnusedReceiveAddress(walletInfo, this.addressType)
            .subscribe(
                response => {
                    this.address = response;
                    // this.qrString = 'city:' + response;
                    this.qrString = response; // To be compatible with mobile wallet (copay-based), we won't use prefix.
                },
                error => {
                    this.log.error('Failed to get unused receive address:', error);
                }
            )
            ;
    }

    private getAddressesSimpleMode() {

        this.allAddresses = [];
        this.usedAddresses = [];
        this.unusedAddresses = [];
        this.changeAddresses = [];

        const network = this.appState.networkDefinition;

        const xpubkey = this.wallet.activeWallet.extPubKey;
        const root = bip32.fromBase58(xpubkey);

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < 20; i++) {
            // TODO: Find the last used indexed from querying indexer (persisted to IndexedDB locally)
            const address = this.getAddress(root.derivePath('0/' + i), network);
            this.unusedAddresses.push(address);
        }

        const walletInfo = new WalletInfo(this.globalService.getWalletName());
        this.log.info('Wallet info:', walletInfo);

        // this.apiService.getAllAddresses(walletInfo)
        //     .subscribe(
        //         response => {
        //             this.allAddresses = [];
        //             this.usedAddresses = [];
        //             this.unusedAddresses = [];
        //             this.changeAddresses = [];
        //             this.allAddresses = response.addresses;

        //             for (const address of this.allAddresses) {
        //                 if (address.isUsed) {
        //                     this.usedAddresses.push(address.address);
        //                 } else if (address.isChange) {
        //                     this.changeAddresses.push(address.address);
        //                 } else {
        //                     this.unusedAddresses.push(address.address);
        //                 }
        //             }
        //             // }
        //         },
        //         error => {
        //             this.log.error('Failed to get addresses:', error);
        //         }
        //     );
    }

    private getAddressesFullNode() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());

        this.apiService.getAllAddresses(walletInfo, this.addressType)
            .subscribe(
                response => {
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
                }
            );
    }
}
