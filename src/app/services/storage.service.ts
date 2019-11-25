import Dexie from 'dexie';

export class StorageService extends Dexie {

    wallets: Dexie.Table<IWallet, number>;

    constructor(databaseName) {
        super(databaseName);

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            wallets: '++id, name, network, coinType',
        });
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
