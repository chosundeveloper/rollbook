import { NextRequest, NextResponse } from "next/server";
import { getPrayerSchedules, createPrayerSchedule } from "@/lib/prayer-store";
import type { CreatePrayerSchedulePayload } from "@/types/prayer";

export async function GET() {
  try {
    const schedules = await getPrayerSchedules();
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Failed to fetch prayer schedules:", error);
    return NextResponse.json(
      { message: "기도회 일정을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreatePrayerSchedulePayload;

    if (!body.name || !body.startDate || !body.endDate || !body.times || body.times.length === 0) {
      return NextResponse.json(
        { message: "필수 정보를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const schedule = await createPrayerSchedule(
      body.name,
      body.startDate,
      body.endDate,
      body.times
    );

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error("Failed to create prayer schedule:", error);
    return NextResponse.json(
      { message: "기도회 일정 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
