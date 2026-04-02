import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

type AuthPayload = {
  role: "admin";
  username: string;
};

export function verifyAdminCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function signAdminToken(username: string) {
  return jwt.sign({ role: "admin", username } satisfies AuthPayload, JWT_SECRET, {
    expiresIn: "12h",
  });
}

export function getTokenFromRequest(req: NextRequest) {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export function verifyAdminToken(token: string) {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return payload.role === "admin";
  } catch {
    return false;
  }
}
