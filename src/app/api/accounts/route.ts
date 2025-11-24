import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { isAuthEnabled } from "@/lib/auth";
import {
  getAllAccountsWithPassword,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountByUsername,
} from "@/lib/user-store";

async function requireAdmin(request: NextRequest) {
  if (!isAuthEnabled()) {
    return null;
  }
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = parseSessionToken(cookie);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const account = await getAccountByUsername(session.username);
  if (!account?.roles?.includes("admin")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const error = await requireAdmin(request);
  if (error) return error;

  const allAccounts = await getAllAccountsWithPassword();
  // passwordHash 제외, passwordPlain은 포함
  const accounts = allAccounts.map(({ passwordHash: _, ...rest }) => rest);
  return NextResponse.json({ accounts });
}

export async function POST(request: NextRequest) {
  const error = await requireAdmin(request);
  if (error) return error;

  const body = await request.json();
  const { username, password, displayName, roles, cellId } = body;

  if (!username || !password) {
    return NextResponse.json(
      { message: "아이디와 비밀번호는 필수입니다." },
      { status: 400 }
    );
  }

  try {
    const account = await createAccount(username, password, displayName, roles, cellId);
    return NextResponse.json(
      { account: { ...account, passwordHash: undefined } },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "계정 생성 실패" },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const error = await requireAdmin(request);
  if (error) return error;

  const body = await request.json();
  const { id, displayName, password, roles, cellId } = body;

  if (!id) {
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }

  const updated = await updateAccount(id, { displayName, password, roles, cellId });
  if (!updated) {
    return NextResponse.json({ message: "계정을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ account: { ...updated, passwordHash: undefined } });
}

export async function DELETE(request: NextRequest) {
  const error = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }

  const deleted = await deleteAccount(id);
  if (!deleted) {
    return NextResponse.json({ message: "계정을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
