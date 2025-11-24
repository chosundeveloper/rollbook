import { NextRequest, NextResponse } from "next/server";
import { parseSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { getAccountByUsername } from "@/lib/user-store";
import { isAuthEnabled } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!isAuthEnabled()) {
    // Return mock data when auth is disabled for development
    return NextResponse.json({ cellId: null, roles: ["admin"] });
  }

  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = parseSessionToken(cookie);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const account = await getAccountByUsername(session.username);
  if (!account) {
    return NextResponse.json({ message: "Account not found" }, { status: 401 });
  }

  return NextResponse.json({
    username: account.username,
    displayName: account.displayName,
    roles: account.roles,
    cellId: account.cellId,
  });
}
