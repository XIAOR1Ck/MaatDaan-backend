export const rpName = process.env.WEBAUTHN_RP_NAME || 'My App';
export const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
export const origin = process.env.WEBAUTHN_ORIGIN || `http://${rpID}:9090`;


