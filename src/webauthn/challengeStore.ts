type ChallengeEntry = {
  challenge: string;
  expiresAt: number;
};

const CHALLENGE_TTL_MS = 2 * 60 * 1000; // 2 minutes

const store = new Map<string, ChallengeEntry>();

export async function setChallenge(userId: string, challenge: string): Promise<void> {
  store.set(userId, { challenge, expiresAt: Date.now() + CHALLENGE_TTL_MS });
}

export async function getChallenge(userId: string): Promise<string | null> {
  const entry = store.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(userId);
    return null;
  }
  return entry.challenge;
}

export async function clearChallenge(userId: string): Promise<void> {
  store.delete(userId);
}
