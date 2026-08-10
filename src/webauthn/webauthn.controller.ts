import { Request, Response } from 'express';
import * as webauthnService from './webauthn.service';
import db from '../models';

const { Users } = db as any;

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Unexpected error';
}

export async function registerOptions(req: Request, res: Response) {
  try {
    const { username } = req.body as { username?: string };
    if (!username) {
      return res.status(400).json({ error: 'username is required' });
    }

    const [user] = await Users.findOne({ where: { username } });

    const options = await webauthnService.getRegistrationOptions(user.id, username);
    req.session.pendingUserId = user.id;

    res.json(options);
  } catch (err) {
    res.status(400).json({ error: errorMessage(err) });
  }
}
