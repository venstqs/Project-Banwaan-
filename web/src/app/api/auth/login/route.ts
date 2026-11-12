import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createSessionToken,
  isAuthConfigured,
  verifyCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: "Authentication environment variables are not configured on the server." },
      { status: 503 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username.trim() || !password) {
    return NextResponse.json(
      { error: "Please enter both username and access passcode." },
      { status: 400 }
    );
  }

  const ok = await verifyCredentials(username, password);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid credentials. Access is restricted to authorized reviewers." },
      { status: 401 }
    );
  }

  const token = await createSessionToken(username.trim());
  const response = NextResponse.json({ ok: true, username: username.trim() });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}

