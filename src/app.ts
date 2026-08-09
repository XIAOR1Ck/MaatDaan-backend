import express from "express";
import cors from "cors";
import { voteService } from "./services";
import voteRoutes from "./routes/voteRoutes";

const app = express();

app.use(express.json());

app.use(
cors({
  origin: "*",
credentials: true,
})
);

// voting routes
//
app.use('/api/votes', voteRoutes);

app.get("/", (_req, res) => {
  res.json({
  success: true,
  message: "Maatdaan API running"
});
});


async function startServer() {
  try {
    await voteService.init('pollingStation');

    console.log('Connected to Hyperledger Fabric');

    const server = app.listen(5000, () => {
      console.log('Server running on port 5000');
    });

    const shutdown = () => {
      console.log('Shutting down...');

      voteService.close();

      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to connect to Fabric:', error);
    process.exit(1);
  }
}

startServer();
