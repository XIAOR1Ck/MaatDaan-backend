// src/routes/voteRoutes.ts
import { Router, Request, Response } from 'express';
import { VoteService } from '../services/voteService';

const router = Router();
const voteService = new VoteService();

let initialized = false;
async function ensureInit() {
    if (!initialized) {
        await voteService.init('org1');
        initialized = true;
    }
}

router.post('/candidates', async (req: Request, res: Response) => {
    try {
        await ensureInit();
        await voteService.initCandidates(req.body.candidates);
        res.status(201).json({ message: 'Candidates initialized' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/voters/:voterId', async (req: Request, res: Response) => {
    try {
        const { voterId } = req.params;

        if (typeof voterId !== 'string' || !voterId) {
            return res.status(400).json({ error: 'voterId is required' });
        }

        await ensureInit();
        await voteService.registerVoter(voterId);
        res.status(201).json({ message: 'Voter registered' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/vote', async (req: Request, res: Response) => {
    try {
        await ensureInit();
        const { voterId, candidateId } = req.body;
        await voteService.castVote(voterId, candidateId);
        res.status(200).json({ message: 'Vote cast successfully' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/results', async (req: Request, res: Response) => {
    try {
        await ensureInit();
        const results = await voteService.getResults();
        res.status(200).json(results);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
