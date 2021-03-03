/* eslint-disable */

export class WalletCreation {
    name: string;
    mnemonic: string;
    password: string;
    passPhrase: string;
    folderPath?: string;

    constructor(name: string, mnemonic: string, password: string, passPhrase: string, folderPath: string = null) {
        this.name = name;
        this.mnemonic = mnemonic;
        this.password = password;
        this.passPhrase = passPhrase;
        this.folderPath = folderPath;
    }
}
