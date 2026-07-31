// src/services/voteService.ts
import { FabricConnection } from './fabricGateway';
import { orgConfigs } from '../config/connections';

export class VoteService {
    private connection = new FabricConnection();

    async init(org: keyof typeof orgConfigs = 'org1') {
        await this.connection.connect(orgConfigs[org]);
    }

    async initCandidates(candidates: { id: string; name: string }[]) {
        const contract = this.connection.getContract();
        await contract.submitTransaction('InitCandidates', JSON.stringify(candidates));
    }

    async registerVoter(voterId: string) {
        const contract = this.connection.getContract();
        await contract.submitTransaction('RegisterVoter', voterId);
    }

    async castVote(voterId: string, candidateId: string) {
        const contract = this.connection.getContract();
        await contract.submitTransaction('CastVote', voterId, candidateId);
    }

    async getResults(): Promise<unknown> {
        const contract = this.connection.getContract();
        const resultBytes = await contract.evaluateTransaction('GetResults');
        return JSON.parse(Buffer.from(resultBytes).toString('utf8'));
    }

    close() {
        this.connection.close();
    }
}
