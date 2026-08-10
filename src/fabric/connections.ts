// src/config/connections.ts
import * as path from 'node:path';

export interface OrgConfig {
    mspId: string;
    peerEndpoint: string;
    peerHostAlias: string;
    certPath: string;
    keyDirectoryPath: string; // cryptogen names key files randomly, so we resolve at runtime
    tlsCertPath: string;
}

const cryptoRoot = path.resolve(__dirname, '../../../organizations/peerOrganizations');

export const orgConfigs: Record<string, OrgConfig> = {
    pollingStation: {
        mspId: 'PollingStationMSP',
        peerEndpoint: 'localhost:11051',
        peerHostAlias: 'peer0.pollingstation.example.com',
        certPath: path.join(cryptoRoot, 'pollingstation.example.com/users/User1@pollingstation.example.com/msp/signcerts'),
        keyDirectoryPath: path.join(cryptoRoot, 'pollingstation.example.com/users/User1@pollingstation.example.com/msp/keystore'),
        tlsCertPath: path.join(cryptoRoot, 'pollingstation.example.com/peers/peer0.pollingstation.example.com/tls/ca.crt'),
    },
    observer: {
        mspId: 'ObserverMSP',
        peerEndpoint: 'localhost:9051',
        peerHostAlias: 'peer0.observer.example.com',
        certPath: path.join(cryptoRoot, 'observer.example.com/users/User1@observer.example.com/msp/signcerts'),
        keyDirectoryPath: path.join(cryptoRoot, 'observer.example.com/users/User1@observer.example.com/msp/keystore'),
        tlsCertPath: path.join(cryptoRoot, 'observer.example.com/peers/peer0.observer.example.com/tls/ca.crt'),
    },
    electionCommission: {
        mspId: 'ElectionCommissionMSP',
        peerEndpoint: 'localhost:7051',
        peerHostAlias: 'peer0.ec.example.com',
        certPath: path.join(cryptoRoot, 'ec.example.com/users/User1@ec.example.com/msp/signcerts'),
        keyDirectoryPath: path.join(cryptoRoot, 'ec.example.com/users/User1@ec.example.com/msp/keystore'),
        tlsCertPath: path.join(cryptoRoot, 'ec.example.com/peers/peer0.ec.example.com/tls/ca.crt'),
    },
};

export const channelName = 'votingchannel';
export const chaincodeName = 'maatdaan';
