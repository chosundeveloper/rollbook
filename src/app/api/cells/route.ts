import { NextRequest, NextResponse } from "next/server";
import { getCellsWithMembers, createCell, updateCell, deleteCell } from "@/lib/cell-store";
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

export async function POST(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => ({}));
  const leaderId = typeof body.leaderId === "string" ? body.leaderId : "";
  const leaderName = typeof body.leaderName === "string" ? body.leaderName.trim() : "";

  if (!leaderId || !leaderName) {
    return NextResponse.json({ message: "셀장을 선택해 주세요." }, { status: 400 });
  }

  const cell = await createCell(leaderId, leaderName);
  return NextResponse.json({ cell });
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  const leaderId = typeof body.leaderId === "string" ? body.leaderId : "";
  const leaderName = typeof body.leaderName === "string" ? body.leaderName.trim() : "";

  if (!id || !leaderId || !leaderName) {
    return NextResponse.json({ message: "셀 ID와 셀장 정보가 필요합니다." }, { status: 400 });
  }

  const cell = await updateCell(id, leaderId, leaderName);
  if (!cell) {
    return NextResponse.json({ message: "셀을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ cell });
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "셀 ID가 필요합니다." }, { status: 400 });
  }

  const deleted = await deleteCell(id);
  if (!deleted) {
    return NextResponse.json({ message: "셀을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
