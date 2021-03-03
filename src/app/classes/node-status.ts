export class NodeStatus {
    public agent: string;
    public version: string;
    public network: string;
    public coinTicker: string;
    public processId: number;
    public consensusHeight: number;
    public blockStoreHeight: number;
    public inboundPeers: [Peer];
    public outbountPeers: [Peer];
    public featuresData: [FeatureData];
    public dataDirectoryPath: string;
    public runningTime: string;
    public difficulty: number;
    public protocolVersion: number;
    public testnet: boolean;
    public relayFee: number;
    public state: string;

    constructor(
        agent: string,
        version: string,
        network: string,
        coinTicker: string,
        processId: number,
        consensusHeight: number,
        blockStoreHeight: number,
        inboundPeers: [Peer],
        outbountPeers: [Peer],
        featuresData: [FeatureData],
        dataDirectoryPath: string,
        runningtime: string,
        difficulty: number,
        protocolVersion: number,
        testnet: boolean,
        relayFee: number,
        state: string) {
        this.agent = agent;
        this.version = version;
        this.network = network;
        this.coinTicker = coinTicker;
        this.processId = processId;
        this.consensusHeight = consensusHeight;
        this.blockStoreHeight = blockStoreHeight;
        this.inboundPeers = inboundPeers;
        this.outbountPeers = outbountPeers;
        this.featuresData = featuresData;
        this.dataDirectoryPath = dataDirectoryPath;
        this.runningTime = runningtime;
        this.difficulty = difficulty;
        this.protocolVersion = protocolVersion;
        this.testnet = testnet;
        this.relayFee = relayFee;
        this.state = state;
    }
}

class Peer {
    public version: string;
    public remoteSocketEndpoint: string;
    public tipHeight: number;

    constructor(version: string, remoteSocketEndpoint: string, tipHeight: number) {
        this.version = version;
        this.remoteSocketEndpoint = remoteSocketEndpoint;
        this.tipHeight = tipHeight;
    }
}

class FeatureData {
    public namespace: string;
    public state: string;

    constructor(namespace: string, state: string) {
        this.namespace = namespace;
        this.state = state;
    }
}
