import { NextRequest, NextResponse } from "next/server";
import { getCellsWithMembers } from "@/lib/cell-store";
import { SESSION_COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { isAuthEnabled } from "@/lib/auth";

function requireAuth(request: NextRequest) {
  if (!isAuthEnabled()) {
    return null;
  }
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = parseSessionToken(cookie);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const cells = await getCellsWithMembers();
  return NextResponse.json({ cells });
}
