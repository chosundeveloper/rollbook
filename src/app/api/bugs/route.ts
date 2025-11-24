import { NextRequest, NextResponse } from "next/server";
import { getAllBugs, createBug, updateBug, deleteBug } from "@/lib/bug-store";
import type { CreateBugPayload, UpdateBugPayload } from "@/types/bug";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function GET() {
  try {
    const bugs = await getAllBugs();
    return NextResponse.json({ bugs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load bugs";
    return errorResponse(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CreateBugPayload;

    if (!payload.title?.trim()) {
      return errorResponse("제목을 입력해주세요.");
    }
    if (!payload.description?.trim()) {
      return errorResponse("내용을 입력해주세요.");
    }

    const bug = await createBug({
      title: payload.title.trim(),
      description: payload.description.trim(),
      priority: payload.priority || "medium",
      reporter: payload.reporter || "익명",
    });

    return NextResponse.json({ bug }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create bug";
    return errorResponse(message, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = (await request.json()) as UpdateBugPayload;

    if (!payload.id) {
      return errorResponse("버그 ID가 필요합니다.");
    }

    const bug = await updateBug(payload);
    if (!bug) {
      return errorResponse("버그를 찾을 수 없습니다.", 404);
    }

    return NextResponse.json({ bug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update bug";
    return errorResponse(message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return errorResponse("버그 ID가 필요합니다.");
    }

    const success = await deleteBug(id);
    if (!success) {
      return errorResponse("버그를 찾을 수 없습니다.", 404);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete bug";
    return errorResponse(message, 500);
  }
}
