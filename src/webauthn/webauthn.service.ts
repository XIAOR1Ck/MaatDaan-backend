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

const { Users, UserWebAuthn } = db as any;

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
    // The WebAuthn "user handle" — does not need to equal your DB id format,
    // but must be stable for this user and <= 64 bytes.
    userID: new TextEncoder().encode(userId),
    userName: username,
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
export async function getAuthenticationOptions(username: string) {
  const user = await Users.findOne({ where: { username } });
  if (!user) {
    throw new Error('User not found');
  }

  const credentials = await UserWebAuthn.findAll({ where: { userId: user.id } });
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

  await setChallenge(user.id, options.challenge);
  return { options, userId: user.id as string };
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
