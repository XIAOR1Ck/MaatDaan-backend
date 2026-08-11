import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  // Secret used to verify END-USER JWTs on incoming requests to this backend
  JWT_SECRET: requireEnv('JWT_SECRET'),

  // Base URL of the separate Fabric Gateway API this backend calls out to
  FABRIC_GATEWAY_URL: requireEnv('FABRIC_GATEWAY_URL'),

  // Static service JWT this backend presents to the Fabric Gateway API
  FABRIC_GATEWAY_JWT: requireEnv('FABRIC_GATEWAY_JWT'),

  PORT: process.env.PORT ?? '3000',
};
