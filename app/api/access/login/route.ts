import { NextRequest, NextResponse } from "next/server";
import {
  getSiteGatePassword,
  getSiteGateToken,
  getSiteGateUsername,
  isSiteGateEnabled,
  SITE_GATE_COOKIE_NAME,
} from "@/lib/site-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isSiteGateEnabled()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await req.json();
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");
    const nextPathRaw = String(body?.next || "/");
    const nextPath = nextPathRaw.startsWith("/") ? nextPathRaw : "/";

    const isValid =
      username === getSiteGateUsername() && password === getSiteGatePassword();

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, next: nextPath });
    response.cookies.set({
      name: SITE_GATE_COOKIE_NAME,
      value: getSiteGateToken(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
