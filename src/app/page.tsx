import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { isAuthEnabled } from "@/lib/auth";
import { getAccountByUsername } from "@/lib/user-store";

export default async function Home() {
  if (isAuthEnabled()) {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = parseSessionToken(cookieValue);
    if (!session) {
      redirect("/login");
    }

    // Check user role and redirect accordingly
    const account = await getAccountByUsername(session.username);
    if (account?.roles?.includes("admin")) {
      redirect("/admin");
    } else if (account?.roles?.includes("leader")) {
      redirect("/cell");
    }

    // Fallback redirect if no specific role
    redirect("/login");
  }

  redirect("/admin");
}
