import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { isAuthEnabled, AUTH_DISABLED } from "@/lib/auth";
import { getAccountByUsername } from "@/lib/user-store";
import { getSessions } from "@/lib/data-store";
import { getPrayerSchedules } from "@/lib/prayer-store";
import LogoutButton from "@/components/logout-button";

export default async function AdminPage() {
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

  const sessions = await getSessions();
  const prayerSchedules = await getPrayerSchedules();
  const authEnabled = !AUTH_DISABLED;

  // Sort by date descending
  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const sortedPrayers = [...prayerSchedules].sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
      {/* Header */}
      <header className="border-b border-slate-200 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
            <p className="text-sm text-slate-500 mt-1">출석부와 기도회를 관리합니다.</p>
          </div>
          {authEnabled && <LogoutButton />}
        </div>

        {/* Navigation Grid */}
        <nav className="grid grid-cols-4 gap-2">
          <Link
            href="/admin/sessions"
            className="flex flex-col items-center gap-1.5 rounded-xl bg-sky-50 p-3 text-sky-700 transition hover:bg-sky-100 active:scale-95"
          >
            <span className="text-xl">📋</span>
            <span className="text-xs font-medium">출석부</span>
          </Link>
          <Link
            href="/admin/prayer"
            className="flex flex-col items-center gap-1.5 rounded-xl bg-amber-50 p-3 text-amber-700 transition hover:bg-amber-100 active:scale-95"
          >
            <span className="text-xl">🙏</span>
            <span className="text-xs font-medium">기도회</span>
          </Link>
          <Link
            href="/admin/members"
            className="flex flex-col items-center gap-1.5 rounded-xl bg-emerald-50 p-3 text-emerald-700 transition hover:bg-emerald-100 active:scale-95"
          >
            <span className="text-xl">👥</span>
            <span className="text-xs font-medium">교인</span>
          </Link>
          <Link
            href="/admin/cells"
            className="flex flex-col items-center gap-1.5 rounded-xl bg-violet-50 p-3 text-violet-700 transition hover:bg-violet-100 active:scale-95"
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs font-medium">셀</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-100 p-3 text-slate-700 transition hover:bg-slate-200 active:scale-95"
          >
            <span className="text-xl">⚙️</span>
            <span className="text-xs font-medium">계정</span>
          </Link>
          <Link
            href="/docs"
            className="flex flex-col items-center gap-1.5 rounded-xl bg-blue-50 p-3 text-blue-700 transition hover:bg-blue-100 active:scale-95"
          >
            <span className="text-xl">📖</span>
            <span className="text-xs font-medium">도움말</span>
          </Link>
          <Link
            href="/admin/feedback"
            className="flex flex-col items-center gap-1.5 rounded-xl bg-rose-50 p-3 text-rose-700 transition hover:bg-rose-100 active:scale-95"
          >
            <span className="text-xl">📬</span>
            <span className="text-xs font-medium">피드백</span>
          </Link>
        </nav>
      </header>

      {/* Attendance Sessions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">출석부 목록</h2>
          <Link
            href="/admin/sessions"
            className="rounded-full bg-sky-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-sky-600 active:scale-95"
          >
            + 새로 만들기
          </Link>
        </div>

        {sortedSessions.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-600 font-medium">출석부가 없습니다</p>
            <p className="text-sm text-slate-400 mt-1">새 출석부를 만들어 보세요</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sortedSessions.slice(0, 5).map((session) => (
              <li key={session.id}>
                <Link
                  href={`/admin/sessions/${session.date}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-sky-50 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                      📅
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">{session.date}</p>
                      <p className="text-xs text-slate-400">
                        {session.title || new Date(session.createdAt).toLocaleDateString("ko-KR") + " 생성"}
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-300 text-lg">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Prayer Schedules */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">기도회 목록</h2>
          <Link
            href="/admin/prayer"
            className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-amber-600 active:scale-95"
          >
            + 새로 만들기
          </Link>
        </div>

        {sortedPrayers.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-8 text-center">
            <div className="text-4xl mb-3">🙏</div>
            <p className="text-slate-600 font-medium">기도회가 없습니다</p>
            <p className="text-sm text-slate-400 mt-1">새 기도회를 만들어 보세요</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sortedPrayers.slice(0, 5).map((prayer) => (
              <li key={prayer.id}>
                <Link
                  href={`/admin/prayer/${prayer.id}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-amber-50 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      🙏
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">{prayer.name}</p>
                      <p className="text-xs text-slate-400">
                        {prayer.startDate} ~ {prayer.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      {prayer.times.length}개
                    </span>
                    <span className="text-slate-300 text-lg">›</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-4 text-center text-white shadow-sm">
          <p className="text-3xl font-bold">{sessions.length}</p>
          <p className="text-xs text-sky-100 mt-1">출석부</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-4 text-center text-white shadow-sm">
          <p className="text-3xl font-bold">{prayerSchedules.length}</p>
          <p className="text-xs text-amber-100 mt-1">기도회</p>
        </div>
        <Link
          href="/cells"
          className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-center text-white shadow-sm transition hover:from-emerald-600 hover:to-emerald-700 active:scale-95"
        >
          <p className="text-2xl">📊</p>
          <p className="text-xs text-emerald-100 mt-1">셀 배치표</p>
        </Link>
      </div>
    </section>
  );
}
