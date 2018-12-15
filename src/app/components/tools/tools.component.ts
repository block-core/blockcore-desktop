import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';
import { ApiService } from 'src/app/services/api.service';
import { WalletInfo } from 'src/app/classes/wallet-info';
import { GlobalService } from 'src/app/services/global.service';
import { MatSnackBar } from '@angular/material';

@Component({
    selector: 'app-tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ToolsComponent implements OnInit {
    @HostBinding('class.app-tools') hostClass = true;

    public resyncTriggered = false;
    public extPubKey: string;

    constructor(
        public snackBar: MatSnackBar,
        public wallet: WalletService,
        private globalService: GlobalService,
        private apiService: ApiService) {

    }

    ngOnInit() {
        const walletInfo = new WalletInfo(this.globalService.getWalletName());
        this.getExtPubKey(walletInfo);
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

    public resync() {
        this.wallet.resync();
        this.resyncTriggered = true;
    }

    public onCopiedClick() {
        this.snackBar.open('The extended public key has been copied to your clipboard.', null, { duration: 3000 });
        return false;
    }
}
