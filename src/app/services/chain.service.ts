import { Injectable } from '@angular/core';
import { Logger } from './logger.service';

export interface Chain {
    name: string;
    chain?: string;
    identity: string;
    tooltip: string;
    port?: number;
    rpcPort?: number;
    apiPort?: number;
    wsPort?: number;
    network: string;
    mode?: string;
    genesisDate?: Date;
    path?: string;
    datafolder?: string;

    private?: number;
    public?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ChainService {

    static singletonInstance: ChainService;

    public availableChains: Array<Chain>;

    constructor(private log: Logger) {

        if (!ChainService.singletonInstance) {

            /** Modify this collection to add additional chain support. */
            this.availableChains = [
                { name: 'Bitcoin', chain: 'BTC', identity: 'bitcoin', tooltip: 'City Hub: Bitcoin', port: 8333, rpcPort: 8332, apiPort: 37220, wsPort: 4336, network: 'bitcoinmain', genesisDate: new Date(2009, 1, 3) },
                { name: 'Bitcoin (Test)', chain: 'BTC', identity: 'bitcoin', tooltip: 'City Hub: Bitcoin', port: 18333, rpcPort: 18332, apiPort: 38220, wsPort: 4336, network: 'bitcointest', genesisDate: new Date(2009, 1, 3) },

                // TODO: Find the WIF (private) and PubKeyHash (public) for BCP, these are copied from City Chain and are not correct.
                { name: 'Blockcore Platform', chain: 'BCP', private: 0xed, public: 0x1c, identity: 'bcp', tooltip: 'Blockcore Platform', port: 15001, rpcPort: 15002, apiPort: 15003, network: 'bcpmain', genesisDate: new Date(2021, 0, 17) },
                { name: 'Blockcore Platform (Test)', chain: 'BCP', private: 0xc2, public: 0x42, identity: 'bcp', tooltip: 'Blockcore Platform', port: 25001, rpcPort: 25002, apiPort: 25003, network: 'bcptest', genesisDate: new Date(2021, 0, 17) },

                { name: 'City Chain', chain: 'CITY', private: 0xed, public: 0x1c, identity: 'city', tooltip: 'City Hub', port: 4333, rpcPort: 4334, apiPort: 4335, wsPort: 4336, network: 'citymain', genesisDate: new Date(2018, 9, 1) },
                { name: 'City Chain (RegTest)', chain: 'CITY', private: 0xc2, public: 0x42, identity: 'city', tooltip: 'City Hub', port: 14333, rpcPort: 14334, apiPort: 14335, wsPort: 14336, network: 'cityregtest', genesisDate: new Date(2018, 9, 1) },
                { name: 'City Chain (Test)', chain: 'CITY', private: 0xc2, public: 0x42, identity: 'city', tooltip: 'City Hub', port: 24333, rpcPort: 24334, apiPort: 24335, wsPort: 24336, network: 'citytest', genesisDate: new Date(2018, 9, 1) },

                { name: 'Stratis', identity: 'stratis', tooltip: 'Stratis Core', port: 16178, rpcPort: 16174, apiPort: 37221, wsPort: 4336, network: 'stratismain', genesisDate: new Date(2016, 8, 6) },
                { name: 'Stratis (RegTest)', identity: 'stratis', tooltip: 'Stratis Core', port: 18444, rpcPort: 18442, apiPort: 37221, wsPort: 4336, network: 'stratisregtest', genesisDate: new Date(2017, 5, 16) },
                { name: 'Stratis (Test)', identity: 'stratis', tooltip: 'Stratis Core', port: 26178, rpcPort: 26174, apiPort: 38221, wsPort: 4336, network: 'stratistest', genesisDate: new Date(2017, 5, 4) },
            ];

            ChainService.singletonInstance = this;
        }

        return ChainService.singletonInstance;
    }

    /** Retrieves a configuration for a blockchain, including the right network name and ports. */
    getChain(name: string = 'city', network: string = 'citymain'): Chain {
        // Couldn't use .find with the current tsconfig setup.
        // const selectedChains = this.availableChains.filter(c => c.identity === name && c.network === network);
        const selectedChains = this.availableChains.filter(c => c.network === network);
        let selectedChain: Chain;

        if (selectedChains.length === 0) {
            this.log.error('The supplied coin parameter is invalid. First available chain selected as default. Argument value: ' + name);
            selectedChain = this.availableChains[0];
        } else {
            selectedChain = selectedChains[0];
        }

        return selectedChain;
    }
}
