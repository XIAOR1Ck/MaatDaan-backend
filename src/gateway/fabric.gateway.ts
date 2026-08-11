import axios, { AxiosInstance, AxiosError } from 'axios';
import { env } from '../env/env';


export interface Election {
  electionId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface Candidate {
  electionId: string;
  candidateId: string;
  name: string;
  affiliation: string;
}

export interface CandidateResult {
  electionId: string;
  candidateId: string;
  name: string;
  affiliation: string;
  voteCount: number;
  votePercentage: number;
  rank: number;
}

export interface ElectionResults {
  electionId: string;
  totalVotes: number;
  results: CandidateResult[];
}

interface GatewayEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}


export class GatewayError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GatewayError';
    this.status = status;
  }
}

const client: AxiosInstance = axios.create({
  baseURL: env.FABRIC_GATEWAY_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the service-level JWT to every outbound request to the gateway.
client.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers.authorization = `Bearer ${env.FABRIC_GATEWAY_JWT}`;
  return config;
});

function toGatewayError(error: unknown): GatewayError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status;
    const message =
      axiosError.response?.data?.message ??
      axiosError.message ??
      'Fabric gateway request failed';
    return new GatewayError(message, status);
  }
  return new GatewayError(
    error instanceof Error ? error.message : String(error),
  );
}


async function request<T>(
  fn: () => Promise<{ data: GatewayEnvelope<T> }>,
): Promise<T> {
  try {
    const response = await fn();
    return response.data.data;
  } catch (error) {
    throw toGatewayError(error);
  }
}

export const voteService = {
  async createElection(
    electionId: string,
    name: string,
    description: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    await request<void>(() =>
      client.post('/api/votes/elections', {
        electionId,
        name,
        description,
        startDate,
        endDate,
      }),
    );
  },

  async addCandidate(
    electionId: string,
    candidateId: string,
    name: string,
    affiliation: string,
  ): Promise<void> {
    await request<void>(() =>
      client.post('/api/votes/candidates', {
        electionId,
        candidateId,
        name,
        affiliation,
      }),
    );
  },

  async getAllElections(): Promise<Election[]> {
    return request<Election[]>(() => client.get('/api/votes/elections'));
  },

  async getCandidates(electionId: string): Promise<Candidate[]> {
    return request<Candidate[]>(() =>
      client.get(`/api/votes/elections/${encodeURIComponent(electionId)}/candidates`),
    );
  },

  async castVote(
    electionId: string,
    candidateId: string,
    proof: string,
  ): Promise<void> {
    await request<void>(() =>
      client.post('/api/votes/votes', {
        electionId,
        candidateId,
        proof,
      }),
    );
  },

  async getResults(electionId: string): Promise<ElectionResults> {
    return request<ElectionResults>(() =>
      client.get(`/api/votes/elections/${encodeURIComponent(electionId)}/results`),
    );
  },
};
