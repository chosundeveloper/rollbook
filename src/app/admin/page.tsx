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
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">관리자 대시보드</h1>
          <p className="text-sm text-slate-600">출석부와 기도회를 관리합니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/sessions"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center transition hover:border-slate-500"
          >
            출석부 관리
          </Link>
          <Link
            href="/admin/prayer"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center transition hover:border-slate-500"
          >
            기도회 관리
          </Link>
          <Link
            href="/admin/members"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center transition hover:border-slate-500"
          >
            교인 관리
          </Link>
          <Link
            href="/admin/cells"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center transition hover:border-slate-500"
          >
            셀 관리
          </Link>
          <Link
            href="/admin/users"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center transition hover:border-slate-500"
          >
            계정 관리
          </Link>
          <Link
            href="/docs"
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 text-center transition hover:border-amber-400 hover:bg-amber-100"
          >
            📖 사용법
          </Link>
          <Link
            href="/bugs"
            className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 text-center transition hover:border-rose-400 hover:bg-rose-100"
          >
            🐛 버그 리포트
          </Link>
          {authEnabled && <LogoutButton />}
        </div>
      </header>

      {/* Attendance Sessions */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">📋 출석부 목록</h2>
          <Link
            href="/admin/sessions"
            className="text-sm text-sky-600 hover:underline"
          >
            + 새 출석부 생성
          </Link>
        </div>

        {sortedSessions.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
            <p className="text-slate-500">생성된 출석부가 없습니다.</p>
            <Link
              href="/admin/sessions"
              className="mt-2 inline-block text-sm text-sky-600 hover:underline"
            >
              첫 출석부 만들기 →
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {sortedSessions.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/admin/sessions/${session.date}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 transition hover:border-sky-300 hover:bg-sky-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📅</span>
                    <div>
                      <p className="font-medium text-slate-700">{session.date}</p>
                      {session.title && (
                        <p className="text-sm text-slate-500">{session.title}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {new Date(session.createdAt).toLocaleDateString("ko-KR")} 생성
                    </span>
                    <span className="text-slate-400">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Prayer Schedules */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">🙏 기도회 목록</h2>
          <Link
            href="/admin/prayer"
            className="text-sm text-sky-600 hover:underline"
          >
            + 새 기도회 생성
          </Link>
        </div>

        {sortedPrayers.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
            <p className="text-slate-500">생성된 기도회가 없습니다.</p>
            <Link
              href="/admin/prayer"
              className="mt-2 inline-block text-sm text-sky-600 hover:underline"
            >
              첫 기도회 만들기 →
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {sortedPrayers.map((prayer) => (
              <li key={prayer.id}>
                <Link
                  href={`/admin/prayer/${prayer.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 transition hover:border-amber-300 hover:bg-amber-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🙏</span>
                    <div>
                      <p className="font-medium text-slate-700">{prayer.name}</p>
                      <p className="text-sm text-slate-500">
                        {prayer.startDate} ~ {prayer.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      {prayer.times.length}개 시간대
                    </span>
                    <span className="text-slate-400">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-sky-600">{sessions.length}</p>
          <p className="text-sm text-slate-600">출석부</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-amber-600">{prayerSchedules.length}</p>
          <p className="text-sm text-slate-600">기도회</p>
        </div>
        <Link
          href="/cells"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center hover:border-emerald-300 hover:bg-emerald-50 transition"
        >
          <p className="text-3xl font-bold text-emerald-600">📊</p>
          <p className="text-sm text-slate-600">셀 배치표 보기</p>
        </Link>
      </div>
    </section>
  );
}
