import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ALLOWED_ORIGIN = process.env.ADMIN_ORIGIN || "http://localhost:5173";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CORS preflight for API routes
  if (pathname.startsWith("/api/") && req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
  }

  // Add CORS headers to all API responses
  if (pathname.startsWith("/api/")) {
    const res = NextResponse.next();
    for (const [key, value] of Object.entries(corsHeaders())) {
      res.headers.set(key, value);
    }
    return res;
  }

  // Protect /admin/* pages (require admin role)
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
    const ADMIN_ROLES = ["admin", "financeiro", "ti"];
    if (!ADMIN_ROLES.includes(token.role as string)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect /leiloes/* pages (require login)
  if (pathname.startsWith("/leiloes")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/leiloes/:path*", "/api/:path*"],
};
