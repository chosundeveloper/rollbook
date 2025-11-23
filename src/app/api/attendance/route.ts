import { NextRequest, NextResponse } from "next/server";
import {
  getAttendanceByDate,
  replaceAttendanceForDate,
  summarizeAttendance,
} from "@/lib/data-store";
import { SaveAttendancePayload } from "@/types/attendance";
import { SESSION_COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { isAuthEnabled } from "@/lib/auth";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function requireAuth(request: NextRequest) {
  if (!isAuthEnabled()) {
    return null;
  }
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = parseSessionToken(cookie);
  if (!session) {
    return errorResponse("Unauthorized", 401);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return errorResponse("Query parameter `date` is required.");
  }

  try {
    const entries = await getAttendanceByDate(date);
    const summary = summarizeAttendance(entries);
    return NextResponse.json({ date, entries, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load attendance";
    return errorResponse(message, 500);
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as SaveAttendancePayload;
    if (!payload?.date) {
      return errorResponse("`date` is required in the request body.");
    }
    if (!Array.isArray(payload.entries)) {
      return errorResponse("`entries` must be an array.");
    }

    const entries = await replaceAttendanceForDate(payload.date, payload.entries);
    const summary = summarizeAttendance(entries);
    return NextResponse.json({ date: payload.date, entries, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save attendance";
    return errorResponse(message, 500);
  }
}
