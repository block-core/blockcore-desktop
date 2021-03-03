export class Recipient {
    destinationAddress: string;
    amount: string;

    constructor(destinationAddress: string, amount: string) {
        this.destinationAddress = destinationAddress;
        this.amount = amount;
    }
}
