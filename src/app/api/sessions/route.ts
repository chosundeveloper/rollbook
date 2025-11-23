import { NextRequest, NextResponse } from "next/server";
import { createSession, getSessions } from "@/lib/data-store";
import { SESSION_COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { CreateSessionPayload } from "@/types/attendance";
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

  const sessions = await getSessions();
  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as CreateSessionPayload;
    const session = await createSession(payload);
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create session";
    return NextResponse.json({ message }, { status: 400 });
  }
}
