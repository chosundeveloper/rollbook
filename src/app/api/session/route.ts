import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/user-store";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { isAuthEnabled } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ ok: true, message: "Authentication disabled." });
  }
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ message: "아이디와 비밀번호를 입력해 주세요." }, { status: 400 });
  }

  const account = await verifyCredentials(username, password);
  if (!account) {
    return NextResponse.json({ message: "계정 정보를 확인해 주세요." }, { status: 401 });
  }

  const sessionToken = createSessionToken(account.username);
  const response = NextResponse.json({ ok: true, user: { username: account.username, displayName: account.displayName } });
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}

export async function DELETE() {
  if (!isAuthEnabled()) {
    return NextResponse.json({ ok: true });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
