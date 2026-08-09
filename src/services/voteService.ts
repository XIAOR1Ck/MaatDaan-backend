// src/services/voteService.ts

import { FabricConnection } from './fabricGateway';
import { orgConfigs } from '../config/connections';

export class VoteService {
  private connection = new FabricConnection();

  async init(org: keyof typeof orgConfigs = 'pollingStation') {
    await this.connection.connect(orgConfigs[org]);
  }

  async createElection(
    electionId: string,
    name: string,
    description: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    const contract = this.connection.getContract();

    await contract.submitTransaction(
      'CreateElection',
      electionId,
      name,
      description,
      startDate,
      endDate,
    );
  }

  async addCandidate(
    electionId: string,
    candidateId: string,
    name: string,
    affiliation: string,
  ): Promise<void> {
    const contract = this.connection.getContract();

    await contract.submitTransaction(
      'AddCandidate',
      electionId,
      candidateId,
      name,
      affiliation,
    );
  }

  async getAllElections(): Promise<unknown> {
    const contract = this.connection.getContract();

    const resultBytes =
      await contract.evaluateTransaction('GetAllElections');

    return JSON.parse(Buffer.from(resultBytes).toString('utf8'));
  }

  async castVote(
    electionId: string,
    candidateId: string,
    proof: string,
  ): Promise<void> {
    const contract = this.connection.getContract();

    await contract.submitTransaction(
      'CastVote',
      electionId,
      candidateId,
      proof,
    );
  }

  async getCandidates(electionId: string): Promise<unknown> {
    const contract = this.connection.getContract();

    const resultBytes =
      await contract.evaluateTransaction(
        'GetCandidates',
        electionId,
      );

    return JSON.parse(Buffer.from(resultBytes).toString('utf8'));
  }

  async getResults(electionId: string): Promise<unknown> {
    const contract = this.connection.getContract();

    const resultBytes =
      await contract.evaluateTransaction(
        'GetResults',
        electionId,
      );

    return JSON.parse(Buffer.from(resultBytes).toString('utf8'));
  }

  close() {
    this.connection.close();
  }
}
