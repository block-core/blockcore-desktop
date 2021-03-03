import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GlobalService {

    static singletonInstance: GlobalService;
    private walletPath: string | undefined;
    private currentWalletName!: string;
    private coinType: number | undefined;
    private coinName: string | undefined;
    private coinUnit: string | undefined;
    private network: string | undefined;
    private decimalLimit = 8;

    constructor() {

        if (!GlobalService.singletonInstance) {
            GlobalService.singletonInstance = this;
        }

        return GlobalService.singletonInstance;

    }

    getWalletPath() {
        return this.walletPath;
    }

    getWalletFullPath() {
        // Forward slash to be more universal? This must be tested on all OS.
        return this.walletPath + '/' + this.currentWalletName + '.wallet.json';
    }

    setWalletPath(walletPath: string) {
        this.walletPath = walletPath;
    }

    getNetwork() {
        return this.network;
    }

    setNetwork(network: string) {
        this.network = network;
    }

    getWalletName(): string {
        return this.currentWalletName;
    }

    setWalletName(currentWalletName: string) {
        this.currentWalletName = currentWalletName;
    }

    getCoinType() {
        return this.coinType;
    }

    setCoinType(coinType: number) {
        this.coinType = coinType;
    }

    getCoinName() {
        return this.coinName;
    }

    setCoinName(coinName: string) {
        this.coinName = coinName;
    }

    getCoinUnit() {
        return this.coinUnit;
    }

    setCoinUnit(coinUnit: string) {
        this.coinUnit = coinUnit;
    }

    transform(value: number): string {
        let temp;
        if (typeof value === 'number') {
            switch (this.getCoinUnit()) {
                case 'BTC':
                    temp = value / 100000000;
                    return temp.toFixed(this.decimalLimit);
                case 'mBTC':
                    temp = value / 100000;
                    return temp.toFixed(this.decimalLimit);
                case 'uBTC':
                    temp = value / 100;
                    return temp.toFixed(this.decimalLimit);
                case 'TBTC':
                    temp = value / 100000000;
                    return temp.toFixed(this.decimalLimit);
                case 'TmBTC':
                    temp = value / 100000;
                    return temp.toFixed(this.decimalLimit);
                case 'TuBTC':
                    temp = value / 100;
                    return temp.toFixed(this.decimalLimit);

                case 'CITY':
                    temp = value / 100000000;
                    return temp.toFixed(this.decimalLimit);
                case 'mCITY':
                    temp = value / 100000;
                    return temp.toFixed(this.decimalLimit);
                case 'uCITY':
                    temp = value / 100;
                    return temp.toFixed(this.decimalLimit);
                case 'TCITY':
                    temp = value / 100000000;
                    return temp.toFixed(this.decimalLimit);
                case 'TmCITY':
                    temp = value / 100000;
                    return temp.toFixed(this.decimalLimit);
                case 'TuCITY':
                    temp = value / 100;
                    return temp.toFixed(this.decimalLimit);

                case 'STRAT':
                    temp = value / 100000000;
                    return temp.toFixed(this.decimalLimit);
                case 'mSTRAT':
                    temp = value / 100000;
                    return temp.toFixed(this.decimalLimit);
                case 'uSTRAT':
                    temp = value / 100;
                    return temp.toFixed(this.decimalLimit);
                case 'TSTRAT':
                    temp = value / 100000000;
                    return temp.toFixed(this.decimalLimit);
                case 'TmSTRAT':
                    temp = value / 100000;
                    return temp.toFixed(this.decimalLimit);
                case 'TuSTRAT':
                    temp = value / 100;
                    return temp.toFixed(this.decimalLimit);

                default:
                    temp = value / 100000000;
                    return temp.toFixed(this.decimalLimit);
            }
        }

        return '';
    }
}
