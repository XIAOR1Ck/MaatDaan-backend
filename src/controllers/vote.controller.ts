import { Request, Response } from 'express';
import { voteService, GatewayError } from '../gateway/fabric.gateway';
import crypto from 'crypto';

function handleGatewayError(res: Response, action: string, error: unknown): void {
  console.error(`${action} error:`, error);

  const status = error instanceof GatewayError ? (error.status ?? 500) : 500;

  res.status(status).json({
    success: false,
    message: `Failed to ${action.toLowerCase()}`,
    error: error instanceof Error ? error.message : String(error),
  });
}

export const createElection = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {name, description, startDate, endDate } = req.body;

    if (!name || !description || !startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'All election fields are required',
      });
      return;
    }
  const electionId = crypto.randomUUID();

    await voteService.createElection(electionId, name, description, startDate, endDate);

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
    });
  } catch (error) {
    handleGatewayError(res, 'Create election', error);
  }
};

export const addCandidate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { electionId, name, affiliation } = req.body;

    if (!electionId || !name || !affiliation) {
      res.status(400).json({
        success: false,
        message: 'All candidate fields are required',
      });
      return;
    }
    const candidateId = crypto.randomUUID();
    await voteService.addCandidate(electionId, candidateId, name, affiliation);

    res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
    });
  } catch (error) {
    handleGatewayError(res, 'Add candidate', error);
  }
};

export const getAllElections = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Typed as Election[] — autocompletes electionId, name, description, etc.
    const elections = await voteService.getAllElections();

    res.status(200).json({
      success: true,
      data: elections,
    });
  } catch (error) {
    handleGatewayError(res, 'Get elections', error);
  }
};

export const getCandidates = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { electionId } = req.params;

    if (!electionId) {
      res.status(400).json({
        success: false,
        message: 'Election ID is required',
      });
      return;
    }

    const candidates = await voteService.getCandidates(electionId as string);

    res.status(200).json({
      success: true,
      data: candidates,
    });
  } catch (error) {
    handleGatewayError(res, 'Get candidates', error);
  }
};

export const castVote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { electionId, candidateId } = req.body;

    if (!electionId || !candidateId ) {
      res.status(400).json({
        success: false,
        message: 'Election ID, candidate ID and proof are required',
      });
      return;
    }
const combined = process.env.SERVER_PROOF_HASH + electionId + candidateId;

const proof = crypto.createHash('sha256').update(combined).digest('hex');

    await voteService.castVote(electionId, candidateId, proof);

    res.status(201).json({
      success: true,
      message: 'Vote cast successfully',
    });
  } catch (error) {
    handleGatewayError(res, 'Cast vote', error);
  }
};

export const getResults = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { electionId } = req.params;

    if (!electionId) {
      res.status(400).json({
        success: false,
        message: 'Election ID is required',
      });
      return;
    }

    const results = await voteService.getResults(electionId as string);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    handleGatewayError(res, 'Get results', error);
  }
};
