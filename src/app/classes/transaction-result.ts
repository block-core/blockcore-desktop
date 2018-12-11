export interface TransactionResult {

    transactionId: string;
    outputs: TransactionOutput[];
}

export interface TransactionOutput {
    address: string;
    amount: string;
    opReturnData: string;
}
