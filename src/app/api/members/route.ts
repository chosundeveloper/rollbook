import { NextRequest, NextResponse } from "next/server";
import { addMember, getMembers } from "@/lib/data-store";
import { NewMemberPayload } from "@/types/attendance";
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

  const members = await getMembers();
  return NextResponse.json({ members });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as NewMemberPayload;
    const member = await addMember(payload);
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add member";
    return NextResponse.json({ message }, { status: 400 });
  }
}
