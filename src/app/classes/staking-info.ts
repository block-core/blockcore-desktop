export interface StakingInfo {
    enabled: boolean;
    staking: boolean;
    errors: any;
    currentBlockSize: number;
    currentBlockTx: number;
    pooledTx: number;
    difficulty: number;
    searchInterval: number;
    weight: number;
    netStakeWeight: number;
    expectedTime: number;
}
