import { Router } from "express";
import { authorize, protect } from "../middleware/auth";

import {
  createElection,
  addCandidate,
  getAllElections,
  getCandidates,
  castVote,
  getResults,
} from '../controllers/vote.controller'; // need to specify the correct path, but we can just say './controller' or something; user will adjust.

const voteRouter = Router();

voteRouter.post('/elections', protect, authorize("admin"), createElection);
voteRouter.get('/elections', protect, getAllElections);
voteRouter.post('/candidates' , protect, addCandidate);
voteRouter.get('/elections/:electionId/candidates', protect, getCandidates);
voteRouter.post('/votes', protect, authorize("user"), castVote);
voteRouter.get('/elections/:electionId/results',protect, getResults);

export default voteRouter;
