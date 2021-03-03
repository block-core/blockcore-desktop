export class GeneralInfo {

    chainTip: number;
    connectedNodes: number;
    creationTime: Date | string | number | any;
    isChainSynced: boolean;
    isDecrypted: boolean;
    lastBlockSyncedHeight: number;
    network: string;
    walletFilePath: string;

    constructor(
        chainTip: number, connectedNodes: number, creationTime: Date, isChainSynced: boolean, isDecrypted: boolean, lastBlockSyncedHeight: number, network: string, walletFilePath: string) {
        this.chainTip = chainTip;
        this.connectedNodes = connectedNodes;
        this.creationTime = creationTime;
        this.isChainSynced = isChainSynced;
        this.isDecrypted = isDecrypted;
        this.lastBlockSyncedHeight = lastBlockSyncedHeight;
        this.network = network;
        this.walletFilePath = walletFilePath;
    }
}
