import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  AdminAuthConfigError,
  createAdminSessionToken,
  verifyAdminCredentials,
} from "../../../../lib/admin-auth";
import {
  clearFailedLogins,
  getLoginRateLimit,
  recordFailedLogin,
} from "../../../../lib/admin-login-rate-limit";

const MAX_FORM_BYTES = 8192;

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const originUrl = new URL(origin);
    if (process.env.NODE_ENV === "production" && originUrl.protocol !== "https:") return false;
    return originUrl.host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

function getClientAddress(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor ? forwardedFor.slice(0, 128) : "unknown";
}

function redirectToLogin(request: NextRequest, error: string, retryAfterSeconds?: number) {
  const response = NextResponse.redirect(new URL(`/admin/login?error=${error}`, request.url), 303);
  response.headers.set("Cache-Control", "private, no-store");
  if (retryAfterSeconds) response.headers.set("Retry-After", String(retryAfterSeconds));
  return response;
}

async function readForm(request: NextRequest): Promise<URLSearchParams | null> {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/x-www-form-urlencoded") return null;

  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_FORM_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new URLSearchParams(new TextDecoder().decode(body));
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return new NextResponse("Forbidden", { status: 403 });

  const address = getClientAddress(request);
  const rateLimit = getLoginRateLimit(address);
  if (rateLimit.limited) return redirectToLogin(request, "limited", rateLimit.retryAfterSeconds);

  const form = await readForm(request);
  const username = form?.get("username");
  const password = form?.get("password");
  if (typeof username !== "string" || typeof password !== "string") {
    const result = recordFailedLogin(address);
    return redirectToLogin(request, result.limited ? "limited" : "invalid", result.retryAfterSeconds);
  }

  try {
    const credentialsMatch = await verifyAdminCredentials(username, password);
    if (!credentialsMatch) {
      const result = recordFailedLogin(address);
      return redirectToLogin(request, result.limited ? "limited" : "invalid", result.retryAfterSeconds);
    }

    clearFailedLogins(address);
    const response = NextResponse.redirect(new URL("/admin", request.url), 303);
    response.headers.set("Cache-Control", "private, no-store");
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_TTL_SECONDS,
    });
    return response;
  } catch (error) {
    if (error instanceof AdminAuthConfigError) return redirectToLogin(request, "unavailable");
    return redirectToLogin(request, "unavailable");
  }
}
