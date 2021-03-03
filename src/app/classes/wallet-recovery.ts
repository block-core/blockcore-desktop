/* eslint-disable */

export class WalletRecovery {

    name: string;
    mnemonic: string;
    password: string;
    passPhrase: string;
    creationDate: Date;
    folderPath?: string;

    constructor(walletName: string, mnemonic: string, password: string, passPhrase: string, creationDate: Date, folderPath: string = null) {
        this.name = walletName;
        this.mnemonic = mnemonic;
        this.password = password;
        this.passPhrase = passPhrase;
        this.creationDate = creationDate;
        this.folderPath = folderPath;
    }
}
