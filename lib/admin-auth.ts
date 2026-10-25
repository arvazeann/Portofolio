import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SCRYPT_COST = 1 << 15;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const SCRYPT_KEY_LENGTH = 32;
const SCRYPT_MAX_MEMORY = 64 * 1024 * 1024;

export const ADMIN_SESSION_COOKIE = "portfolio_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;

type AdminAuthConfig = {
  username: string;
  passwordSalt: Buffer;
  passwordDigest: Buffer;
  passwordHashFingerprint: string;
  sessionSecret: Buffer;
};

type AdminSession = {
  version: 1;
  issuedAt: number;
  expiresAt: number;
  credentialFingerprint: string;
  nonce: string;
};

export class AdminAuthConfigError extends Error {
  constructor() {
    super("Admin authentication is not configured correctly.");
    this.name = "AdminAuthConfigError";
  }
}

function decodeBase64Url(value: string, expectedLength: number): Buffer | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const decoded = Buffer.from(value, "base64url");
  return decoded.length === expectedLength ? decoded : null;
}

function getAdminAuthConfig(): AdminAuthConfig {
  const username = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const sessionSecretValue = process.env.ADMIN_SESSION_SECRET;

  if (!username || !/^[A-Za-z0-9._-]{3,64}$/.test(username)) {
    throw new AdminAuthConfigError();
  }

  if (!passwordHash || passwordHash.length > 256) {
    throw new AdminAuthConfigError();
  }

  const [version, saltValue, digestValue, extra] = passwordHash.split("$");
  const passwordSalt = saltValue ? decodeBase64Url(saltValue, 16) : null;
  const passwordDigest = digestValue ? decodeBase64Url(digestValue, SCRYPT_KEY_LENGTH) : null;
  if (version !== "scrypt-v1" || extra !== undefined || !passwordSalt || !passwordDigest) {
    throw new AdminAuthConfigError();
  }

  if (!sessionSecretValue || sessionSecretValue.length > 128) {
    throw new AdminAuthConfigError();
  }
  const sessionSecret = decodeBase64Url(sessionSecretValue, 32);
  if (!sessionSecret) throw new AdminAuthConfigError();

  return {
    username,
    passwordSalt,
    passwordDigest,
    passwordHashFingerprint: createHash("sha256").update(passwordHash).digest("base64url"),
    sessionSecret,
  };
}

function constantTimeStringEqual(left: string, right: string): boolean {
  const leftDigest = createHash("sha256").update(left).digest();
  const rightDigest = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

function derivePasswordDigest(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, SCRYPT_KEY_LENGTH, {
      N: SCRYPT_COST,
      r: SCRYPT_BLOCK_SIZE,
      p: SCRYPT_PARALLELIZATION,
      maxmem: SCRYPT_MAX_MEMORY,
    }, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const config = getAdminAuthConfig();
  if (username.length > 128 || password.length > 1024) return false;

  const [usernameMatches, derivedDigest] = await Promise.all([
    Promise.resolve(constantTimeStringEqual(username, config.username)),
    derivePasswordDigest(password, config.passwordSalt),
  ]);
  const passwordMatches = timingSafeEqual(derivedDigest, config.passwordDigest);
  return usernameMatches && passwordMatches;
}

export function createAdminSessionToken(now = Math.floor(Date.now() / 1000)): string {
  const config = getAdminAuthConfig();
  const session: AdminSession = {
    version: 1,
    issuedAt: now,
    expiresAt: now + ADMIN_SESSION_TTL_SECONDS,
    credentialFingerprint: config.passwordHashFingerprint,
    nonce: randomBytes(16).toString("base64url"),
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", config.sessionSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined, now = Math.floor(Date.now() / 1000)): boolean {
  if (!token || token.length > 2048) return false;

  try {
    const config = getAdminAuthConfig();
    const [payload, signatureValue, extra] = token.split(".");
    if (!payload || !signatureValue || extra !== undefined) return false;

    const signature = decodeBase64Url(signatureValue, 32);
    if (!signature) return false;
    const expectedSignature = createHmac("sha256", config.sessionSecret).update(payload).digest();
    if (!timingSafeEqual(signature, expectedSignature)) return false;

    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const session = JSON.parse(decoded) as Partial<AdminSession>;
    if (session.version !== 1
      || !Number.isSafeInteger(session.issuedAt)
      || !Number.isSafeInteger(session.expiresAt)
      || typeof session.credentialFingerprint !== "string"
      || typeof session.nonce !== "string") return false;

    const issuedAt = session.issuedAt as number;
    const expiresAt = session.expiresAt as number;
    if (issuedAt > now + 60
      || expiresAt <= now
      || expiresAt <= issuedAt
      || expiresAt - issuedAt > ADMIN_SESSION_TTL_SECONDS) return false;

    return constantTimeStringEqual(session.credentialFingerprint, config.passwordHashFingerprint);
  } catch {
    return false;
  }
}

export async function hasValidAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminSession(): Promise<void> {
  if (!await hasValidAdminSession()) redirect("/admin/login");
}
