import { NextRequest, NextResponse } from "next/server";
import { getPrayerChecks, savePrayerChecks } from "@/lib/prayer-store";
import type { UpdatePrayerCheckPayload } from "@/types/prayer";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scheduleId = searchParams.get("scheduleId");
    const cellId = searchParams.get("cellId");

    if (!scheduleId) {
      return NextResponse.json(
        { message: "scheduleId가 필요합니다." },
        { status: 400 }
      );
    }

    const checks = await getPrayerChecks(scheduleId, cellId || undefined);
    return NextResponse.json({ checks });
  } catch (error) {
    console.error("Failed to fetch prayer checks:", error);
    return NextResponse.json(
      { message: "기도회 체크 내역을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as UpdatePrayerCheckPayload;

    if (!body.scheduleId || !body.cellId || !body.entries) {
      return NextResponse.json(
        { message: "필수 정보를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    await savePrayerChecks(body.scheduleId, body.cellId, body.entries);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save prayer checks:", error);
    return NextResponse.json(
      { message: "기도회 체크 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}
