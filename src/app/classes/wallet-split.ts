export class WalletSplit {

    constructor(walletName: string, accountName: string, walletPassword: string, totalAmountToSplit: string, utxosCount: number) {
        this.walletName = walletName;
        this.accountName = accountName;
        this.walletPassword = walletPassword;
        this.totalAmountToSplit = totalAmountToSplit;
        this.utxosCount = utxosCount;
    }

    walletName: string;
    accountName: string;
    walletPassword: string;
    totalAmountToSplit: string;
    utxosCount: number;
}
