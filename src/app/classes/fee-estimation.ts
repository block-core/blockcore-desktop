import { Recipient } from './recipient';

export class FeeEstimation {
    walletName: string;
    accountName: string;
    recipients: Recipient[];
    feeType: string;
    allowUnconfirmed: boolean;
    opReturnData: string;
    opReturnAmount: string;

    constructor(walletName: string, accountName: string, destinationAddress: string, amount: string, feeType: string, allowUnconfirmed: boolean, opReturnData: string, opReturnAmount: string) {
        this.walletName = walletName;
        this.accountName = accountName;
        this.recipients = [new Recipient(destinationAddress, amount)];
        this.feeType = feeType;
        this.allowUnconfirmed = allowUnconfirmed;
        this.opReturnData = opReturnData || null;
        this.opReturnAmount = opReturnAmount || null;
    }
}
