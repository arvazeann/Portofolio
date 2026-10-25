import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "../../../../lib/admin-auth";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return new NextResponse("Forbidden", { status: 403 });
  try {
    const originUrl = new URL(origin);
    if (originUrl.host.toLowerCase() !== host.toLowerCase()
      || (process.env.NODE_ENV === "production" && originUrl.protocol !== "https:")) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.headers.set("Cache-Control", "private, no-store");
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
