export class WalletInfo {
    public walletName: string;
    public accountName: string = 'account 0';

    constructor(walletName: string, accountName: string = 'account 0') {
        this.walletName = walletName;
        this.accountName = accountName;
    }
}
