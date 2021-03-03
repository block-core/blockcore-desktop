/* eslint-disable */

import { Component, ViewEncapsulation, HostBinding, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { ApiService } from '../../services/api.service';
import { FormBuilder } from '@angular/forms';
import { DetailsService } from '../../services/details.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { WalletService } from '../../services/wallet.service';
import { CoinService } from 'src/app/services/coin.service';
import { CoincapService } from 'src/app/services/coincap.service';
import { Subscription } from 'rxjs';
import { CoincapAsset } from 'src/app/classes/coincap-asset';
import { CoinAsset } from 'src/app/classes/coin-asset';
import { NotificationService } from 'src/app/services/notification.service';
import { P2pb2bAsset } from 'src/app/classes/p2pb2b2-asset';
import { AppModes } from 'src/app/shared/app-modes';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
    @HostBinding('class.dashboard') hostClass = true;
    public walletInfo = 'When you send, balance can\ntemporarily go from confirmed\nto unconfirmed.';
    public tickerInfo = 'Change to the next ticker.';
    public coins: CoinAsset[] = new Array<CoinAsset>();
    public selectedCoinTicker: CoinAsset;

    private selectedCoinTickerIndex = -1;
    private subscriptions: Subscription[];
    public searchInput = '';

    constructor(
        private apiService: ApiService,
        private coincap: CoincapService,
        private coin: CoinService,
        private globalService: GlobalService,
        public appState: ApplicationStateService,
        public notifications: NotificationService,
        private detailsService: DetailsService,
        public wallet: WalletService,
        public appModes: AppModes,
        private fb: FormBuilder) {

        // Make sure we update wallet at higher frequency.
        this.wallet.active = true;
    }

    ngOnInit() {
        // this.startSubscriptions();
    }

    changeTicker(change) {
        this.selectedCoinTickerIndex += change;

        if (this.selectedCoinTickerIndex < 0) {
            this.selectedCoinTickerIndex = (this.coins.length - 1);
        } else if (this.selectedCoinTickerIndex >= this.coins.length) {
            this.selectedCoinTickerIndex = 0;
        }

        this.selectedCoinTicker = this.coins[this.selectedCoinTickerIndex];
    }

    lookup() {

    }

    private startSubscriptions() {

        this.subscriptions = [];

        let asset = this.appState.chain;

        if (asset === 'city') {
            asset = 'bitcoin'; // Until coincap.io supports CITY, we'll revert to Bitcoin.
        }

        // this.subscriptions.push(this.coincap.getAsset(asset)
        //     .subscribe(
        //         response => {
        //             const coincapAsset = response.data as CoincapAsset;
        //             coincapAsset.pair = 'USD';
        //             coincapAsset.volumepair = 'USD';
        //             this.coins[1] = this.mapCoincapToAsset(coincapAsset);
        //         },
        //         error => {
        //             this.coincap.handleException(error);
        //             // this.reactivate();
        //         }
        //     ));

        // this.subscriptions.push(this.coin.getTicker('btc')
        //     .subscribe(
        //         response => {
        //             const coinAsset = response.result as P2pb2bAsset;
        //             coinAsset.pair = 'BTC';
        //             coinAsset.volumepair = 'CITY';
        //             this.coins[0] = this.mapP2pb2bToAsset(coinAsset);

        //             if (this.selectedCoinTickerIndex === -1) {
        //                 this.changeTicker(1);
        //             }
        //         },
        //         error => {
        //             this.coincap.handleException(error);
        //             // this.reactivate();
        //         }
        //     ));

        // this.subscriptions.push(this.coin.getTicker('usd')
        //     .subscribe(
        //         response => {
        //             const coinAsset = response.result as P2pb2bAsset;
        //             coinAsset.pair = 'USD';
        //             coinAsset.volumepair = 'CITY';
        //             this.coins[1] = this.mapP2pb2bToAsset(coinAsset);
        //         },
        //         error => {
        //             this.coincap.handleException(error);
        //             this.reactivate();
        //         }
        //     ));
    }

    private mapP2pb2bToAsset(coin: P2pb2bAsset): CoinAsset {

        const asset: CoinAsset = {
            changePercent24Hr: coin.change,
            marketCap: '0',
            maxSupply: '0',
            price: coin.last,
            volume24Hr: coin.volume,
            symbol: 'CITY',
            name: 'City Coin',
            pair: coin.pair,
            volumepair: coin.volumepair
        };

        return asset;
    }

    private mapCoincapToAsset(coin: CoincapAsset): CoinAsset {

        const asset: CoinAsset = {
            changePercent24Hr: coin.changePercent24Hr,
            marketCap: '0',
            maxSupply: '0',
            price: coin.priceUsd,
            volume24Hr: coin.volumeUsd24Hr,
            symbol: 'BTC',
            name: 'Bitcoin',
            pair: coin.pair,
            volumepair: coin.volumepair
        };

        return asset;
    }

    private cancelSubscriptions() {
        if (!this.subscriptions) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.subscriptions.length; i++) {
            this.subscriptions[i].unsubscribe();
        }
    }

    /** Called to cancel and restart all subscriptions. */
    private reactivate() {
        this.cancelSubscriptions();
        this.startSubscriptions();
    }

    ngOnDestroy() {
        // When navigate away from dashboard, we'll make the wallet update more slowly.
        this.wallet.active = false;
        this.cancelSubscriptions();
    }
}
