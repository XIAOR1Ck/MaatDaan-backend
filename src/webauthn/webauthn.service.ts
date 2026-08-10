//WebAuthn Components import
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

//WebAuthn Types import
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';

import { setChallenge, getChallenge, clearChallenge } from './challengeStore';
import { rpName, rpID, origin } from './webauthn.config';

import db from '../models';

const { User, UserWebAuthn } = db as any;

// Convert bytes returned by @simplewebauthn into a base64url string for TEXT storage
function uint8ToBase64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

// Convert the base64url string we stored back into bytes for verification
function base64urlToUint8(b64url: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64url, 'base64url'));
}

export async function getRegistrationOptions(userId: string, username: string) {
  const existingCredentials = await UserWebAuthn.findAll({ where: { userId } });

  const options = await generateRegistrationOptions({
  rpName,
  rpID,
  userID: new TextEncoder().encode(userId),
  userName: username,
  // Chrome has a known bug where an empty user.displayName causes
  // registration to fail with a confusing error — always fall back
  // to the username instead of letting this default to "".
  userDisplayName: username,
  attestationType: 'none',
  excludeCredentials: existingCredentials.map((cred: any) => ({
    id: cred.credentialId,
    transports: (cred.transports as AuthenticatorTransportFuture[]) || undefined,
  })),
  authenticatorSelection: {
    residentKey: 'preferred',
    userVerification: 'preferred',
  },
} as GenerateRegistrationOptionsOpts);
await setChallenge(userId, options.challenge);
  return options;
}


export async function verifyRegistration(
  userId: string,
  response: RegistrationResponseJSON
): Promise<void> {
  const expectedChallenge = await getChallenge(userId);
  if (!expectedChallenge) {
    throw new Error('No registration challenge found for this user (it may have expired)');
  }

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  } as VerifyRegistrationResponseOpts);

  await clearChallenge(userId);

  const { verified, registrationInfo } = verification;
  if (!verified || !registrationInfo) {
    throw new Error('Registration verification failed');
  }

  const { credential } = registrationInfo;

  await UserWebAuthn.create({
    credentialId: credential.id,
    userId,
    publicKey: uint8ToBase64url(credential.publicKey),
    counter: credential.counter,
    transports: response.response.transports || null,
  });
}

// Authentication
//
export async function getAuthenticationOptions(userId: string) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const credentials = await UserWebAuthn.findAll({ where: { userId: user.userId } });
  if (credentials.length === 0) {
    throw new Error('No passkeys registered for this user');
  }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
    allowCredentials: credentials.map((cred: any) => ({
      id: cred.credentialId,
      transports: (cred.transports as AuthenticatorTransportFuture[]) || undefined,
    })),
  } as GenerateAuthenticationOptionsOpts);

  await setChallenge(user.userId, options.challenge);
  return { options, userId: user.userId as string };
}

export async function verifyAuthentication(
  userId: string,
  response: AuthenticationResponseJSON
): Promise<void> {
  const expectedChallenge = await getChallenge(userId);
  if (!expectedChallenge) {
    throw new Error('No authentication challenge found for this user (it may have expired)');
  }

  const credential = await UserWebAuthn.findOne({
    where: { credentialId: response.id, userId },
  });
  if (!credential) {
    throw new Error('Credential is not registered to this user');
  }

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.credentialId,
      publicKey: base64urlToUint8(credential.publicKey),
      counter: Number(credential.counter),
      transports: (credential.transports as AuthenticatorTransportFuture[]) || undefined,
    },
  } as VerifyAuthenticationResponseOpts);

  await clearChallenge(userId);

  const { verified, authenticationInfo } = verification;
  if (!verified) {
    throw new Error('Authentication verification failed');
  }

  // Persist the updated signature counter to detect cloned authenticators.
  credential.counter = authenticationInfo.newCounter;
  await credential.save();
}
