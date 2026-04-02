import { NextRequest, NextResponse } from "next/server";
import { signAdminToken, verifyAdminCredentials } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "username and password are required" },
        { status: 400 },
      );
    }

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signAdminToken(username);
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
