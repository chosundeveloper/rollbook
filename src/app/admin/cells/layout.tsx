import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { isAuthEnabled } from "@/lib/auth";
import { getAccountByUsername } from "@/lib/user-store";

export default async function AdminCellsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isAuthEnabled()) {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = parseSessionToken(cookieValue);
    if (!session) {
      redirect("/login");
    }
    const account = await getAccountByUsername(session.username);
    if (!account || !account.roles?.includes("admin")) {
      redirect("/cell");
    }
  }

  return <>{children}</>;
}
