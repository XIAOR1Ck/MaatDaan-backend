// src/server.ts
import express from 'express';
import voteRoutes from './routes/voteRoutes';

const app = express();
app.use(express.json());
app.use('/api', voteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Voting API running on port ${PORT}`));
