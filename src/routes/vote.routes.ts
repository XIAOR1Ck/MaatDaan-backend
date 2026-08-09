
import { Router } from 'express';

import {
  createElection,
  addCandidate,
  getAllElections,
  getCandidates,
  castVote,
  getResults,
} from '../controllers/vote.controller';

const voteRoutes= Router();

voteRoutes.post('/elections', createElection);

voteRoutes.get('/elections', getAllElections);

voteRoutes.post('/candidates', addCandidate);

voteRoutes.get(
  '/elections/:electionId/candidates',
  getCandidates,
);

voteRoutes.post('/votes', castVote);

voteRoutes.get(
  '/elections/:electionId/results',
  getResults,
);

export default voteRoutes;
