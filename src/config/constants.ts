import * as path from 'path';
// Path to crypto materials
export const cryptoPath = path.resolve(__dirname, '..', '..', 'organizations', "peerOrganizations", "pollingstation.example.com");

// path to User private key directories
export const keyDirectoryPath = path.resolve(cryptoPath, 'users', 'Users1@pollingstation.example.com', 'msp', 'keystore');

// path to peer tls certificate
export const tlsCertPath = path.resolve(cryptoPath, 'peers', 'peer0.pollingstation.example.com','tls', 'ca.crt');

export const peerEndpoint = 'localhost:7051';
 export const peerHostAlias = 'peer0.pollingstation.example.com';


