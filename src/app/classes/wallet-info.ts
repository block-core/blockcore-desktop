export class WalletInfo {
    public walletName: string;
    public accountName = 'account 0';

    constructor(walletName: string, accountName = 'account 0') {
        this.walletName = walletName;
        this.accountName = accountName;
    }
}
