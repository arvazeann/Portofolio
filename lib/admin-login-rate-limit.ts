import "server-only";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_TRACKED_ADDRESSES = 5000;

type LoginAttempts = {
  windowStartedAt: number;
  attempts: number;
  blockedUntil: number;
};

const attemptsByAddress = new Map<string, LoginAttempts>();

function getFreshAttempts(key: string, now: number): LoginAttempts {
  const existing = attemptsByAddress.get(key);
  if (existing && existing.blockedUntil > now) return existing;
  if (existing && now - existing.windowStartedAt < WINDOW_MS) return existing;

  if (!existing) pruneExpiredEntries(now);
  const fresh = { windowStartedAt: now, attempts: 0, blockedUntil: 0 };
  attemptsByAddress.set(key, fresh);
  return fresh;
}

function pruneExpiredEntries(now: number) {
  if (attemptsByAddress.size < MAX_TRACKED_ADDRESSES) return;
  for (const [key, value] of attemptsByAddress) {
    if (value.blockedUntil <= now && now - value.windowStartedAt >= WINDOW_MS) {
      attemptsByAddress.delete(key);
    }
  }
  while (attemptsByAddress.size >= MAX_TRACKED_ADDRESSES) {
    const oldestKey = attemptsByAddress.keys().next().value;
    if (oldestKey === undefined) break;
    attemptsByAddress.delete(oldestKey);
  }
}

export function getLoginRateLimit(key: string, now = Date.now()) {
  const attempts = getFreshAttempts(key, now);
  return {
    limited: attempts.blockedUntil > now,
    retryAfterSeconds: Math.max(0, Math.ceil((attempts.blockedUntil - now) / 1000)),
  };
}

export function recordFailedLogin(key: string, now = Date.now()) {
  pruneExpiredEntries(now);
  const attempts = getFreshAttempts(key, now);
  attempts.attempts += 1;
  if (attempts.attempts >= MAX_ATTEMPTS) attempts.blockedUntil = now + LOCKOUT_MS;
  return {
    limited: attempts.blockedUntil > now,
    retryAfterSeconds: Math.max(0, Math.ceil((attempts.blockedUntil - now) / 1000)),
  };
}

export function clearFailedLogins(key: string) {
  attemptsByAddress.delete(key);
}
