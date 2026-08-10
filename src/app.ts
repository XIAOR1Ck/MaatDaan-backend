import express from "express";
import 'dotenv/config';
import cors from "cors";
import { voteService } from "./fabric";
import voteRoutes from "./routes/vote.routes";
import authRoutes from "./routes/auth.routes";
import mailRouter from "./routes/mail.routes";
import webauthnRouter from "./routes/webauthn.routes";

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

//Auth Routes
app.use('/api/auth', authRoutes);

app.get("/", (_req, res) => {
  res.json({
  success: true,
  message: "Maatdaan API running"
});
});


//MailRouter for test
app.use('/api/mail', mailRouter);

// WebAuth Routs
app.use('/api/webauthn/', webauthnRouter);


async function startServer() {
  try {
    await voteService.init('pollingStation');

    console.log('Connected to Hyperledger Fabric');

    const server = app.listen(process.env.APP_PORT, () => {
      console.log(`Server running on port ${process.env.APP_PORT}`);
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
