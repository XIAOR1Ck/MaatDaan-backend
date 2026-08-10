import { Request, Response } from 'express';
import * as webauthnService from '../webauthn/webauthn.service';
import db from '../models';
import jwt from 'jsonwebtoken';

const { User } = db as any;


function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Unexpected error';
}

export async function registerOptions(req: Request, res: Response) {
  try {
    if (!req.user) {
  return res.status(401).json({
    success: false,
    message: "Unauthorized",
  });
}

const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ error: 'username is required' });
    }

    // Demo behavior: find or create the user by username.
    // Swap this for your real signup/auth flow as needed.
    const user = await User.findByPk(userId, {
  attributes: { exclude: ['password']}
});

  if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }
console.log("registration userId: ", user.userId);
    const options = await webauthnService.getRegistrationOptions(user.userId, user.email);
    const pendingToken = jwt.sign(
  { userId: user.userId, purpose: 'webauthn-register' },
  process.env.JWT_SECRET!,
  { expiresIn: '2m' }
);

    res.json({options, pendingToken});
  } catch (err) {
    res.status(400).json({ error: errorMessage(err) });
  }
}

export async function registerVerify(req: Request, res: Response) {
  try {
    const { pendingToken, response} = req.body;
    let payload;
try {
console.log("pending Token: ", pendingToken);
  payload = jwt.verify(pendingToken, process.env.JWT_SECRET!) as { userId: string; purpose: string };
console.log("payload: ", payload);
console.log("payload user id: ", payload.userId);
} catch {
  return res.status(400).json({ error: 'Invalid or expired registration token' });
}
if (payload.purpose !== 'webauthn-register') {
  return res.status(400).json({ error: 'Invalid token purpose' });
}
    

    await webauthnService.verifyRegistration(payload.userId, response);

    res.json({ verified: true });
  } catch (err) {
    res.status(400).json({ error: errorMessage(err) });
  }
}

export async function loginOptions(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ error: 'user not found' });
    }
    const { options, userId: resolvedUserId } = await webauthnService.getAuthenticationOptions(userId);
    const pendingToken = jwt.sign(
      { userId: resolvedUserId, purpose: 'webauthn-login' },
      process.env.JWT_SECRET!,
      { expiresIn: '2m' }
    );
    res.json({ options, pendingToken });
  } catch (err) {
    res.status(400).json({ error: errorMessage(err) });
  }
}

export async function loginVerify(req: Request, res: Response) {
  try {
    const { pendingToken, response} = req.body;
    let payload;
try {
  payload = jwt.verify(pendingToken, process.env.JWT_SECRET!) as { userId: string; purpose: string };
} catch {
  return res.status(400).json({ error: 'Invalid or expired registration token' });
}
if (payload.purpose !== 'webauthn-login') {
  return res.status(400).json({ error: 'Invalid token purpose' });
}
    

    await webauthnService.verifyAuthentication(payload.userId, response);

    res.json({ verified: true });
  } catch (err) {
    res.status(400).json({ error: errorMessage(err) });
  }
}
