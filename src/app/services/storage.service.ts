import { Injectable } from '@angular/core';

/** The storage service will recognice the current wallet and storage wallet-dependent items isolated. */
@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private walletName: string;
    private coinType: string;

    constructor() {

    }

    setWalletName(walletName: string, coinType: string) {
        this.walletName = walletName;
        this.coinType = coinType;
    }

    getIsolatedKey(key: string) {
        return this.coinType + ':' + this.walletName + ':' + key;
    }

    getValue(key: string, defaultValue?: string, isolated?: boolean): string {
        if (isolated) {
            key = this.getIsolatedKey(key);
        }

        return localStorage.getItem(key) || defaultValue;
    }

    getNumber(key: string, defaultValue?: number, isolated?: boolean): number {
        if (isolated) {
            key = this.getIsolatedKey(key);
        }

        const val = localStorage.getItem(key);

        if (val == null) {
            return defaultValue;
        }

        return Number(val);
    }

    setValue(key: string, value: string, isolated?: boolean) {
        if (isolated) {
            key = this.getIsolatedKey(key);
        }

        localStorage.setItem(key, value);
    }

    getJSON(key: string, defaultValue?: string, isolated?: boolean): any {
        if (isolated) {
            key = this.getIsolatedKey(key);
        }

        let value = localStorage.getItem(key);

        if (value == null) { // null or undefined
            value = defaultValue || '{}'; // if we don't have a default value, we make it empty JSON object.
        }

        return JSON.parse(value);
    }

    setJSON(key: string, value: any, isolated?: boolean) {
        if (isolated) {
            key = this.getIsolatedKey(key);
        }

        localStorage.setItem(key, JSON.stringify(value));
    }
}

export interface IWallet {
    id?: number;
    name: string;
    isExtPubKeyWallet: boolean;
    extPubKey: string;
    encryptedSeed: string;
    chainCode: string;
    network: string;
    creationTime: number;
    coinType: number;
    lastBlockSyncedHeight: number;
    lastBlockSyncedHash: string;
}
