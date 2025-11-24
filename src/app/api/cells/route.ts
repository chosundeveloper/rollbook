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
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : undefined;

  if (!name) {
    return NextResponse.json({ message: "셀 이름을 입력해 주세요." }, { status: 400 });
  }

  const cell = await createCell(name, description);
  return NextResponse.json({ cell });
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : undefined;

  if (!id || !name) {
    return NextResponse.json({ message: "셀 ID와 이름이 필요합니다." }, { status: 400 });
  }

  const cell = await updateCell(id, name, description);
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
