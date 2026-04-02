import { NextRequest, NextResponse } from "next/server";
import { getSiteGateToken, isSiteGateEnabled, SITE_GATE_COOKIE_NAME } from "@/lib/site-gate";

const PUBLIC_PATH_PREFIXES = ["/_next", "/access", "/api/access", "/favicon.ico"];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  // Allow static files such as /images/foo.png
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

export function middleware(req: NextRequest) {
  if (!isSiteGateEnabled()) {
    return NextResponse.next();
  }

  const { pathname, search } = req.nextUrl;
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const gateCookie = req.cookies.get(SITE_GATE_COOKIE_NAME)?.value;
  if (gateCookie && gateCookie === getSiteGateToken()) {
    return NextResponse.next();
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/access";
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/:path*",
};
