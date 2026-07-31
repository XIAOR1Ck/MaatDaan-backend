import * as grpc from '@grpc/grpc-js';
import { connect, hash, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import * as path from 'path';
import { TextDecoder } from 'node:util';

const utf8Decoder = new TextDecoder();
const channelName = envOrDefault('CHANNEL_NAME', 'votingchannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'maatdaan');

async function main(): Promise<void> {
    
    const credentials = await fs.readFile('path/to/certificate.pem');

    const privateKeyPem = await fs.readFile('path/to/privateKey.pem');
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    const signer = signers.newPrivateKeySigner(privateKey);

    const tlsRootCert = await fs.readFile('path/to/tlsRootCertificate.pem');
    const client = new grpc.Client('gateway.example.org:1337', grpc.credentials.createSsl(tlsRootCert));

    const gateway = connect({
        identity: { mspId: 'myorg', credentials },
        signer,
        hash: hash.sha256,
        client,
    });

    try {
        const network = gateway.getNetwork('channelName');
        const contract = network.getContract('chaincodeName');

        const putResult = await contract.submitTransaction('put', 'time', new Date().toISOString());
        console.log('Put result:', utf8Decoder.decode(putResult));

        const getResult = await contract.evaluateTransaction('get', 'time');
        console.log('Get result:', utf8Decoder.decode(getResult));
    } finally {
        gateway.close();
        client.close();
    }
}

main().catch(console.error);

function envOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}
