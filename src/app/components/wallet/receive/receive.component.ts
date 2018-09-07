import { Component, HostBinding, OnDestroy, ViewEncapsulation, OnInit } from '@angular/core';
import { ApplicationStateService } from '../../../services/application-state.service';
import { ApiService } from '../../../services/api.service';
import { GlobalService } from '../../../services/global.service';
import { WalletInfo } from '../../../classes/wallet-info';
import { MatSnackBar } from '@angular/material';
import { WalletService } from '../../../services/wallet.service';
import { Logger } from '../../../services/logger.service';

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
        private apiService: ApiService,
        public snackBar: MatSnackBar,
        private log: Logger,
        private wallet: WalletService,
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
                    if (response.status >= 200 && response.status < 400) {
                        this.address = response.json();
                        this.qrString = 'city:' + response.json();
                    }
                },
                error => {
                    this.log.error('Failed to get first receive address:', error);
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
            )
            ;
    }

    private getUnusedReceiveAddress() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());

        this.apiService.getUnusedReceiveAddress(walletInfo)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        this.address = response.json();
                        this.qrString = 'city:' + response.json();
                    }
                },
                error => {
                    this.log.error('Failed to get unused receive address:', error);
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
            )
            ;
    }

    private getAddresses() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());

        this.apiService.getAllAddresses(walletInfo)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        this.allAddresses = [];
                        this.usedAddresses = [];
                        this.unusedAddresses = [];
                        this.changeAddresses = [];
                        this.allAddresses = response.json().addresses;

                        for (const address of this.allAddresses) {
                            if (address.isUsed) {
                                this.usedAddresses.push(address.address);
                            } else if (address.isChange) {
                                this.changeAddresses.push(address.address);
                            } else {
                                this.unusedAddresses.push(address.address);
                            }
                        }

                    }
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
