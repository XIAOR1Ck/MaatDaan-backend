// src/services/fabricGateway.ts
import * as grpc from '@grpc/grpc-js';
import { connect, Gateway, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { OrgConfig, channelName, chaincodeName } from '../config/connections';

export class FabricConnection {
    private client!: grpc.Client;
    private gateway!: Gateway;

    async connect(org: OrgConfig): Promise<void> {
        this.client = await this.newGrpcConnection(org);
        const identity = await this.newIdentity(org);
        const signer = await this.newSigner(org);

        this.gateway = connect({
            client: this.client,
            identity,
            signer,
            evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
            endorseOptions: () => ({ deadline: Date.now() + 15000 }),
            submitOptions: () => ({ deadline: Date.now() + 5000 }),
            commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
        });
    }

    getContract() {
        const network = this.gateway.getNetwork(channelName);
        return network.getContract(chaincodeName);
    }

    close(): void {
        this.gateway?.close();
        this.client?.close();
    }

    private async newGrpcConnection(org: OrgConfig): Promise<grpc.Client> {
        const tlsRootCert = await fs.readFile(org.tlsCertPath);
        const credentials = grpc.credentials.createSsl(tlsRootCert);
        return new grpc.Client(org.peerEndpoint, credentials, {
            'grpc.ssl_target_name_override': org.peerHostAlias,
        });
    }

    private async newIdentity(org: OrgConfig): Promise<Identity> {
        const files = await fs.readdir(org.certPath);
        const certFile = files.find(f => f.endsWith('.pem') || f.includes('cert'));
        if (!certFile) throw new Error(`No cert found in ${org.certPath}`);
        const credentials = await fs.readFile(path.join(org.certPath, certFile));
        return { mspId: org.mspId, credentials };
    }

    private async newSigner(org: OrgConfig): Promise<Signer> {
        const files = await fs.readdir(org.keyDirectoryPath);
        const keyFile = files[0]; // cryptogen generates one key with a hashed name
        if (!keyFile) throw new Error(`No key found in ${org.keyDirectoryPath}`);
        const privateKeyPem = await fs.readFile(path.join(org.keyDirectoryPath, keyFile));
        const privateKey = crypto.createPrivateKey(privateKeyPem);
        return signers.newPrivateKeySigner(privateKey);
    }
}
