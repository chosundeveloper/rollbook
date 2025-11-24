import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SESSION_COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { isAuthEnabled } from "@/lib/auth";
import { getAccountByUsername } from "@/lib/user-store";

export default async function Home() {
  if (isAuthEnabled()) {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = parseSessionToken(cookieValue);

    if (session) {
      // Check user role and redirect accordingly
      const account = await getAccountByUsername(session.username);
      if (account?.roles?.includes("admin")) {
        redirect("/admin");
      } else if (account?.roles?.includes("leader")) {
        redirect("/cell");
      }
    }
  } else {
    redirect("/admin");
  }

  // Show landing page for non-logged in users
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-transparent to-transparent opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-sky-100 px-4 py-1.5 text-sm font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20">
              2청년부 전용
            </span>
            <h1 className="mt-6 bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
              출석부 관리 시스템
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              셀 출석과 기도회 참여를 한 곳에서 간편하게 관리하세요.
              <br />
              셀장과 관리자 모두를 위한 직관적인 도구입니다.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-sky-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-sky-500 hover:shadow-xl hover:shadow-sky-500/25"
              >
                <span className="relative flex items-center gap-2">
                  로그인하기
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-xl border-2 border-amber-200 bg-amber-50 px-8 py-4 text-base font-semibold text-amber-700 shadow-sm transition-all duration-300 hover:border-amber-300 hover:bg-amber-100"
              >
                📖 사용법 가이드
              </Link>
              <Link
                href="/cells"
                className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
              >
                셀 배치표 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">주요 기능</h2>
            <p className="mt-4 text-lg text-slate-600">역할에 따른 맞춤형 기능을 제공합니다</p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-500/10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-100 text-sky-600 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">출석 체크</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                온라인/오프라인/결석 상태를 간편하게 기록하고, 방문자도 별도로 관리할 수 있습니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">기도회 관리</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                새벽/저녁 기도회 일정을 생성하고, 셀원별 참석 여부를 날짜별로 체크합니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">셀 관리</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                셀장/부셀장/셀원 구성을 관리하고, 셀 배치표를 한눈에 확인할 수 있습니다.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">교인 관리</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                교인 정보(이름, 출생년도, 직분)를 등록하고 관리합니다.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-500/10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-100 text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">계정 관리</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                관리자/셀장 계정을 생성하고 권한을 부여합니다.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">모바일 지원</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                스마트폰에서도 편리하게 사용할 수 있는 반응형 디자인입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Flow Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">사용자별 흐름도</h2>
            <p className="mt-4 text-lg text-slate-600">역할에 따라 다른 기능을 사용합니다</p>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            {/* Admin Flow */}
            <div className="rounded-2xl border-2 border-sky-100 bg-gradient-to-br from-sky-50 to-white p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-sky-900">관리자</h3>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">1</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">로그인</h4>
                    <p className="text-sm text-slate-600">관리자 계정으로 로그인</p>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-sky-200 py-2" />
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">2</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">대시보드</h4>
                    <p className="text-sm text-slate-600">전체 출석 현황 확인 및 관리</p>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-sky-200 py-2" />
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">3</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">관리 메뉴</h4>
                    <p className="text-sm text-slate-600">교인/셀/계정/기도회 관리</p>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-sky-200 py-2" />
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">4</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">출석부 생성</h4>
                    <p className="text-sm text-slate-600">날짜별 출석부 생성 (출석부 관리)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cell Leader Flow */}
            <div className="rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-emerald-900">셀장</h3>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">1</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">로그인</h4>
                    <p className="text-sm text-slate-600">셀장 계정으로 로그인</p>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-emerald-200 py-2" />
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">2</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">셀 출석부</h4>
                    <p className="text-sm text-slate-600">담당 셀의 출석 체크</p>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-emerald-200 py-2" />
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">3</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">기도회 체크</h4>
                    <p className="text-sm text-slate-600">셀원별 기도회 참석 기록</p>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-emerald-200 py-2" />
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">4</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">저장</h4>
                    <p className="text-sm text-slate-600">출석/기도회 데이터 저장</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Flow Diagram */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">시스템 구조</h2>
            <p className="mt-4 text-lg text-slate-600">전체 시스템의 데이터 흐름</p>
          </div>

          <div className="mt-16 overflow-x-auto">
            <div className="mx-auto min-w-[600px] max-w-4xl">
              {/* Flow Diagram */}
              <div className="relative rounded-2xl border border-slate-200 bg-white p-8">
                <div className="flex flex-col items-center gap-6">
                  {/* Top Row - Users */}
                  <div className="flex w-full justify-around">
                    <div className="flex flex-col items-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="mt-2 text-sm font-medium text-slate-700">관리자</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="mt-2 text-sm font-medium text-slate-700">셀장</span>
                    </div>
                  </div>

                  {/* Arrows Down */}
                  <div className="flex w-full justify-around">
                    <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>

                  {/* Middle Row - Features */}
                  <div className="grid w-full grid-cols-4 gap-4">
                    <div className="flex flex-col items-center rounded-xl bg-slate-50 p-4">
                      <span className="text-2xl">👤</span>
                      <span className="mt-1 text-xs font-medium text-slate-600">교인 관리</span>
                    </div>
                    <div className="flex flex-col items-center rounded-xl bg-slate-50 p-4">
                      <span className="text-2xl">🏠</span>
                      <span className="mt-1 text-xs font-medium text-slate-600">셀 관리</span>
                    </div>
                    <div className="flex flex-col items-center rounded-xl bg-slate-50 p-4">
                      <span className="text-2xl">📋</span>
                      <span className="mt-1 text-xs font-medium text-slate-600">출석 체크</span>
                    </div>
                    <div className="flex flex-col items-center rounded-xl bg-slate-50 p-4">
                      <span className="text-2xl">🙏</span>
                      <span className="mt-1 text-xs font-medium text-slate-600">기도회</span>
                    </div>
                  </div>

                  {/* Arrows Down */}
                  <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>

                  {/* Bottom Row - Data Storage */}
                  <div className="flex items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-white shadow-lg">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    <span className="text-lg font-semibold">데이터 저장소</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-sky-600 to-indigo-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            지금 바로 시작하세요
          </h2>
          <p className="mt-4 text-lg text-sky-100">
            간편한 로그인으로 출석 관리를 시작할 수 있습니다
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-sky-600 shadow-lg transition-all duration-300 hover:bg-sky-50 hover:shadow-xl"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 text-center text-sm text-slate-400">
        <p>2청년부 출석부 관리 시스템</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/docs" className="text-slate-500 hover:text-slate-300">
            사용법 가이드
          </Link>
          <Link href="/bugs" className="text-slate-500 hover:text-slate-300">
            버그 리포트
          </Link>
        </div>
      </footer>
    </main>
  );
}
