import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';
import { ApiService } from 'src/app/services/api.service';
import { WalletInfo } from 'src/app/classes/wallet-info';
import { GlobalService } from 'src/app/services/global.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
    selector: 'app-tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ToolsComponent implements OnInit {
    @HostBinding('class.app-tools') hostClass = true;

    public resyncTriggered = false;
    public extPubKey: string | undefined;

    constructor(
        public snackBar: MatSnackBar,
        public wallet: WalletService,
        private notifications: NotificationService,
        private globalService: GlobalService,
        private apiService: ApiService) {

    }

    ngOnInit() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());
        this.getExtPubKey(walletInfo);
    }

    public resync() {
        this.wallet.resync();
        this.resyncTriggered = true;

        this.notifications.add({
            title: 'Wallet Synchronization',
            hint: 'Your wallet is updating its history',
            message: 'You triggered the wallet re-sync option from the tools section. This will scan the blockchain for any transactions that are related to your wallet, and store that information in your history.<br><br>Your balance might show incorrect sum during this process.',
            icon: 'info'
        });
    }

    public onCopiedClick() {
        this.snackBar.open('The extended public key has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }

    private getExtPubKey(walletInfo: WalletInfo) {
        this.apiService.getExtPubkey(walletInfo)
            .subscribe(
                response => {
                    this.extPubKey = response;
                },
                error => {
                    this.apiService.handleError(error);
                }
            )
            ;
    }
}
