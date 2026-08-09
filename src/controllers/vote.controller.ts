// src/controllers/voteController.ts

import { Request, Response } from 'express';
import { voteService } from '../services';

// createElection conreoller
export const createElection = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      electionId,
      name,
      description,
      startDate,
      endDate,
    } = req.body;

    if (
      !electionId ||
      !name ||
      !description ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'All election fields are required',
      });
    }

    await voteService.createElection(
      electionId,
      name,
      description,
      startDate,
      endDate,
    );

    return res.status(201).json({
      success: true,
      message: 'Election created successfully',
      data: {
        electionId,
      },
    });
  } catch (error) {
    console.error('Create election error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create election',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};


//Add candidate
export const addCandidate = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      electionId,
      candidateId,
      name,
      affiliation,
    } = req.body;

    if (
      !electionId ||
      !candidateId ||
      !name ||
      !affiliation
    ) {
      return res.status(400).json({
        success: false,
        message: 'All candidate fields are required',
      });
    }

    await voteService.addCandidate(
      electionId,
      candidateId,
      name,
      affiliation,
    );

    return res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
      data: {
        electionId,
        candidateId,
      },
    });
  } catch (error) {
    console.error('Add candidate error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to add candidate',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// get election route
//
export const getAllElections = async (
  req: Request,
  res: Response,
) => {
  try {
    const elections = await voteService.getAllElections();

    return res.status(200).json({
      success: true,
      data: elections,
    });
  } catch (error) {
    console.error('Get elections error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve elections',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

//Get Candidates route
//
export const getCandidates = async (
  req: Request<{electionId: string}>,
  res: Response,
) => {
  try {
    const { electionId } = req.params;

    if (!electionId) {
      return res.status(400).json({
        success: false,
        message: 'Election ID is required',
      });
    }

    const candidates =
      await voteService.getCandidates(electionId);

    return res.status(200).json({
      success: true,
      data: candidates,
    });
  } catch (error) {
    console.error('Get candidates error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve candidates',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

//Cast Vote
//
export const castVote = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      electionId,
      candidateId,
      proof,
    } = req.body;

    if (!electionId || !candidateId || !proof) {
      return res.status(400).json({
        success: false,
        message: 'Election ID, candidate ID and proof are required',
      });
    }

    await voteService.castVote(
      electionId,
      candidateId,
      proof,
    );

    return res.status(201).json({
      success: true,
      message: 'Vote cast successfully',
    });
  } catch (error) {
    console.error('Cast vote error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to cast vote',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get Results
//
export const getResults = async (
  req: Request<{electionId: string}>,
  res: Response,
) => {
  try {
    const { electionId } = req.params;

    if (!electionId) {
      return res.status(400).json({
        success: false,
        message: 'Election ID is required',
      });
    }

    const results = await voteService.getResults(electionId);

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Get results error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve election results',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
