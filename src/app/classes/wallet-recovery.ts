export class WalletRecovery {

  constructor(walletName: string, mnemonic: string, password: string, passPhrase: string, creationDate: Date, folderPath: string = null) {
    this.name = walletName;
    this.mnemonic = mnemonic;
    this.password = password;
    this.passPhrase = passPhrase;
    this.creationDate = creationDate;
    this.folderPath = folderPath;
  }

  name: string;
  mnemonic: string;
  password: string;
  passPhrase: string;
  creationDate: Date;
  folderPath?: string;
}
