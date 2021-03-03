import { Recipient } from './recipient';

export class TransactionBuilding {
    walletName: string;
    accountName: string;
    password: string;
    recipients: Recipient[];
    feeAmount: number;
    allowUnconfirmed: boolean;
    shuffleOutputs: boolean;
    singleChangeAddress: boolean;

    constructor(walletName: string, accountName: string, password: string, destinationAddress: string, amount: string, feeType: string, feeAmount: number, allowUnconfirmed: boolean, shuffleOutputs: boolean, singleChangeAddress = false) {
        this.walletName = walletName;
        this.accountName = accountName;
        this.password = password;
        this.recipients = [new Recipient(destinationAddress, amount)];
        this.feeAmount = feeAmount;
        this.allowUnconfirmed = allowUnconfirmed;
        this.shuffleOutputs = shuffleOutputs;
        this.singleChangeAddress = singleChangeAddress;
    }
}
