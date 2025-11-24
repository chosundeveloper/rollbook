import { NextRequest, NextResponse } from "next/server";
import { addMemberToCell, removeMemberFromCell } from "@/lib/cell-store";
import { SESSION_COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { isAuthEnabled } from "@/lib/auth";
import type { CellRole } from "@/types/attendance";

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

const VALID_ROLES: CellRole[] = ["leader", "subleader", "member"];

export async function POST(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => ({}));
  const cellId = typeof body.cellId === "string" ? body.cellId : "";
  const memberId = typeof body.memberId === "string" ? body.memberId : "";
  const role = typeof body.role === "string" ? body.role : "member";

  if (!cellId || !memberId) {
    return NextResponse.json({ message: "셀 ID와 멤버 ID가 필요합니다." }, { status: 400 });
  }

  if (!VALID_ROLES.includes(role as CellRole)) {
    return NextResponse.json({ message: "올바른 역할이 아닙니다." }, { status: 400 });
  }

  const cell = await addMemberToCell(cellId, memberId, role as CellRole);
  if (!cell) {
    return NextResponse.json({ message: "셀을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ cell });
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const cellId = searchParams.get("cellId");
  const memberId = searchParams.get("memberId");

  if (!cellId || !memberId) {
    return NextResponse.json({ message: "셀 ID와 멤버 ID가 필요합니다." }, { status: 400 });
  }

  const removed = await removeMemberFromCell(cellId, memberId);
  if (!removed) {
    return NextResponse.json({ message: "셀 또는 멤버를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
