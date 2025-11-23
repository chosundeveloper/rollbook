import AttendanceBoard from "@/components/attendance-board";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { isAuthEnabled } from "@/lib/auth";

export default async function Home() {
  if (isAuthEnabled()) {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = parseSessionToken(cookieValue);
    if (!session) {
      redirect("/login");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-12 pt-10">
      <AttendanceBoard />
    </main>
  );
}
