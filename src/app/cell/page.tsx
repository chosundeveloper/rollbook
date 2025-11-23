import AttendanceBoard from "@/components/attendance-board";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { isAuthEnabled } from "@/lib/auth";
import { getAccountByUsername } from "@/lib/user-store";

export default async function CellPage() {
  let cellId: string | undefined;
  if (isAuthEnabled()) {
    const cookieValue = cookies().get(SESSION_COOKIE_NAME)?.value;
    const session = parseSessionToken(cookieValue);
    if (!session) {
      redirect("/login");
    }
    const account = await getAccountByUsername(session.username);
    if (!account?.cellId || !account.roles?.includes("leader")) {
      redirect("/admin");
    }
    cellId = account.cellId;
  }

  return <AttendanceBoard mode="cell" cellFilterId={cellId} />;
}
