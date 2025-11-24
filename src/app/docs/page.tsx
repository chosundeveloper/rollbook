import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-12 pt-10">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">사용법 가이드</h1>
            <p className="text-sm text-slate-600">2청년부 출석부 시스템 사용 안내</p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:border-slate-400"
          >
            홈으로
          </Link>
        </header>

        {/* Quick Start Alert */}
        <div className="mb-8 rounded-xl border-2 border-sky-200 bg-sky-50 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="text-2xl">🚀</span> 빠른 시작
          </h2>
          <div className="mt-4 space-y-3 text-sm text-sky-900">
            <p><strong>1단계:</strong> 관리자에게 계정을 받으세요 (아이디/비밀번호)</p>
            <p><strong>2단계:</strong> <Link href="/login" className="underline">로그인 페이지</Link>에서 로그인하세요</p>
            <p><strong>3단계:</strong> 역할에 따라 자동으로 페이지가 이동됩니다</p>
          </div>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-800">목차</h2>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <li><a href="#cell-leader" className="flex items-center gap-2 text-emerald-600 hover:underline"><span>👥</span> 셀장 사용법</a></li>
            <li><a href="#admin" className="flex items-center gap-2 text-sky-600 hover:underline"><span>⚙️</span> 관리자 사용법</a></li>
            <li><a href="#attendance-flow" className="flex items-center gap-2 text-violet-600 hover:underline"><span>📋</span> 출석 체크 플로우</a></li>
            <li><a href="#prayer-flow" className="flex items-center gap-2 text-amber-600 hover:underline"><span>🙏</span> 기도회 체크 플로우</a></li>
            <li><a href="#faq" className="flex items-center gap-2 text-rose-600 hover:underline"><span>❓</span> 자주 묻는 질문</a></li>
            <li><a href="#troubleshoot" className="flex items-center gap-2 text-slate-600 hover:underline"><span>🔧</span> 문제 해결</a></li>
          </ul>
        </nav>

        {/* Content */}
        <div className="space-y-8">
          {/* Cell Leader Guide */}
          <section id="cell-leader" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-emerald-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg">👥</span>
              셀장 사용법
            </h2>

            <div className="mt-6 space-y-6">
              {/* Step 1 */}
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <h3 className="font-semibold text-emerald-800">1. 로그인하기</h3>
                <div className="mt-2 space-y-2 text-sm text-emerald-900">
                  <p>• 관리자에게 받은 <strong>아이디/비밀번호</strong>로 로그인</p>
                  <p>• 로그인 후 자동으로 <strong>셀 출석 페이지</strong>로 이동</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <h3 className="font-semibold text-emerald-800">2. 주일 출석 체크하기</h3>
                <div className="mt-2 space-y-2 text-sm text-emerald-900">
                  <p>• 상단 드롭다운에서 <strong>출석부 날짜</strong>를 선택</p>
                  <p>• 각 셀원의 출석 상태 선택: <span className="rounded bg-emerald-200 px-1">오프라인</span> <span className="rounded bg-sky-200 px-1">온라인</span> <span className="rounded bg-rose-200 px-1">결석</span></p>
                  <p>• 필요시 <strong>메모</strong>를 입력 (예: &quot;다음 주 출장&quot;)</p>
                  <p>• <strong>출석 제출</strong> 버튼 클릭</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <h3 className="font-semibold text-emerald-800">3. 기도회 체크하기</h3>
                <div className="mt-2 space-y-2 text-sm text-emerald-900">
                  <p>• 상단 드롭다운에서 <strong>기도회 일정</strong>을 선택</p>
                  <p>• 셀원별로 참석한 날짜/시간대를 체크 ✓</p>
                  <p>• <strong>저장</strong> 버튼 클릭</p>
                </div>
              </div>

              {/* Important */}
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-amber-800">
                  <span>⚠️</span> 중요!
                </h3>
                <div className="mt-2 space-y-1 text-sm text-amber-900">
                  <p>• 출석부가 없으면 출석 체크가 안 됩니다 → <strong>관리자에게 출석부 생성 요청</strong></p>
                  <p>• 저장 버튼을 누르지 않으면 데이터가 사라집니다!</p>
                </div>
              </div>
            </div>
          </section>

          {/* Admin Guide */}
          <section id="admin" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-sky-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-lg">⚙️</span>
              관리자 사용법
            </h2>

            <div className="mt-6 space-y-6">
              {/* Initial Setup */}
              <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
                <h3 className="font-semibold text-sky-800">🔧 초기 설정 (처음 한 번만)</h3>
                <div className="mt-3 space-y-3 text-sm text-sky-900">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">1</span>
                    <div>
                      <p className="font-medium">교인 등록</p>
                      <p className="text-sky-700">/admin/members → 이름, 출생년도, 직분 입력</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">2</span>
                    <div>
                      <p className="font-medium">셀 생성</p>
                      <p className="text-sky-700">/admin/cells → 셀장 선택하면 자동으로 셀 생성</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">3</span>
                    <div>
                      <p className="font-medium">셀원 배정</p>
                      <p className="text-sky-700">각 셀에 셀원 추가</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">4</span>
                    <div>
                      <p className="font-medium">셀장 계정 생성</p>
                      <p className="text-sky-700">/admin/users → 셀장용 로그인 계정 생성</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Tasks */}
              <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
                <h3 className="font-semibold text-sky-800">📅 매주 할 일</h3>
                <div className="mt-3 space-y-3 text-sm text-sky-900">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">1</span>
                    <div>
                      <p className="font-medium">출석부 생성</p>
                      <p className="text-sky-700">/admin → 출석부 관리 → 새 출석부 생성 (날짜 선택)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">2</span>
                    <div>
                      <p className="font-medium">출석 현황 확인</p>
                      <p className="text-sky-700">/admin에서 전체 출석 현황 조회 및 PDF 다운로드</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Guide */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-800">📂 관리 메뉴 안내</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2 pr-4 font-medium text-slate-700">출석부 관리</td>
                        <td className="py-2 text-slate-600">날짜별 출석부 생성/삭제</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-medium text-slate-700">기도회 관리</td>
                        <td className="py-2 text-slate-600">기도회 일정 생성, 참석 현황 조회</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-medium text-slate-700">교인 관리</td>
                        <td className="py-2 text-slate-600">교인 등록/수정/삭제</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-medium text-slate-700">셀 관리</td>
                        <td className="py-2 text-slate-600">셀 생성, 셀원 배정</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-medium text-slate-700">계정 관리</td>
                        <td className="py-2 text-slate-600">셀장/관리자 계정 생성</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Attendance Flow */}
          <section id="attendance-flow" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-violet-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-lg">📋</span>
              출석 체크 전체 플로우
            </h2>

            <div className="mt-6">
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-6 top-0 h-full w-0.5 bg-violet-200" />

                <div className="space-y-6">
                  <div className="relative flex gap-4">
                    <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white font-bold">1</div>
                    <div className="rounded-lg border border-violet-100 bg-violet-50 p-4 flex-1">
                      <p className="font-semibold text-violet-800">관리자: 출석부 생성</p>
                      <p className="mt-1 text-sm text-violet-700">/admin → 출석부 관리 → 날짜 선택 → 생성</p>
                    </div>
                  </div>

                  <div className="relative flex gap-4">
                    <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white font-bold">2</div>
                    <div className="rounded-lg border border-violet-100 bg-violet-50 p-4 flex-1">
                      <p className="font-semibold text-violet-800">셀장: 출석 체크</p>
                      <p className="mt-1 text-sm text-violet-700">로그인 → 날짜 선택 → 셀원별 상태 선택 → 제출</p>
                    </div>
                  </div>

                  <div className="relative flex gap-4">
                    <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white font-bold">3</div>
                    <div className="rounded-lg border border-violet-100 bg-violet-50 p-4 flex-1">
                      <p className="font-semibold text-violet-800">관리자: 확인 & 다운로드</p>
                      <p className="mt-1 text-sm text-violet-700">/admin에서 전체 현황 확인, PDF 다운로드 가능</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Prayer Flow */}
          <section id="prayer-flow" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-amber-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-lg">🙏</span>
              기도회 체크 전체 플로우
            </h2>

            <div className="mt-6">
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-6 top-0 h-full w-0.5 bg-amber-200" />

                <div className="space-y-6">
                  <div className="relative flex gap-4">
                    <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white font-bold">1</div>
                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 flex-1">
                      <p className="font-semibold text-amber-800">관리자: 기도회 일정 생성</p>
                      <p className="mt-1 text-sm text-amber-700">/admin → 기도회 관리 → 이름, 기간, 시간대 입력</p>
                    </div>
                  </div>

                  <div className="relative flex gap-4">
                    <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white font-bold">2</div>
                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 flex-1">
                      <p className="font-semibold text-amber-800">셀장: 참석 체크</p>
                      <p className="mt-1 text-sm text-amber-700">드롭다운에서 기도회 선택 → 셀원별 참석 날짜/시간 체크 → 저장</p>
                    </div>
                  </div>

                  <div className="relative flex gap-4">
                    <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white font-bold">3</div>
                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 flex-1">
                      <p className="font-semibold text-amber-800">관리자: 현황 조회</p>
                      <p className="mt-1 text-sm text-amber-700">/admin/prayer → 기도회 클릭 → 전체 참석 현황 확인</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-rose-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-lg">❓</span>
              자주 묻는 질문
            </h2>

            <div className="mt-6 space-y-4">
              <details className="group rounded-lg border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer list-none p-4 font-medium text-slate-800">
                  <span className="flex items-center justify-between">
                    출석 체크가 안 돼요
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </span>
                </summary>
                <div className="border-t border-slate-200 p-4 text-sm text-slate-700">
                  <p><strong>원인:</strong> 해당 날짜의 출석부가 생성되지 않았습니다.</p>
                  <p className="mt-2"><strong>해결:</strong> 관리자에게 출석부 생성을 요청하세요. (관리자: /admin → 출석부 관리)</p>
                </div>
              </details>

              <details className="group rounded-lg border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer list-none p-4 font-medium text-slate-800">
                  <span className="flex items-center justify-between">
                    셀원이 안 보여요
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </span>
                </summary>
                <div className="border-t border-slate-200 p-4 text-sm text-slate-700">
                  <p><strong>원인:</strong> 교인이 셀에 배정되지 않았습니다.</p>
                  <p className="mt-2"><strong>해결:</strong> 관리자에게 셀원 배정을 요청하세요. (관리자: /admin/cells)</p>
                </div>
              </details>

              <details className="group rounded-lg border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer list-none p-4 font-medium text-slate-800">
                  <span className="flex items-center justify-between">
                    기도회가 안 보여요
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </span>
                </summary>
                <div className="border-t border-slate-200 p-4 text-sm text-slate-700">
                  <p><strong>원인:</strong> 기도회 일정이 생성되지 않았습니다.</p>
                  <p className="mt-2"><strong>해결:</strong> 관리자에게 기도회 일정 생성을 요청하세요. (관리자: /admin/prayer)</p>
                </div>
              </details>

              <details className="group rounded-lg border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer list-none p-4 font-medium text-slate-800">
                  <span className="flex items-center justify-between">
                    비밀번호를 잊어버렸어요
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </span>
                </summary>
                <div className="border-t border-slate-200 p-4 text-sm text-slate-700">
                  <p>관리자에게 연락하여 계정을 재설정 받으세요.</p>
                </div>
              </details>

              <details className="group rounded-lg border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer list-none p-4 font-medium text-slate-800">
                  <span className="flex items-center justify-between">
                    저장이 안 돼요
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </span>
                </summary>
                <div className="border-t border-slate-200 p-4 text-sm text-slate-700">
                  <p><strong>확인사항:</strong></p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>인터넷 연결 확인</li>
                    <li>출석부/기도회가 선택되어 있는지 확인</li>
                    <li>페이지 새로고침 후 다시 시도</li>
                  </ul>
                  <p className="mt-2">계속 안 되면 <Link href="/bugs" className="text-sky-600 underline">버그 리포트</Link>를 남겨주세요.</p>
                </div>
              </details>
            </div>
          </section>

          {/* Troubleshoot */}
          <section id="troubleshoot" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">🔧</span>
              문제 해결
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800">&quot;출석 정보를 불러오지 못했습니다&quot; 에러</h3>
                <p className="mt-2 text-slate-600">→ 해당 날짜의 출석부가 없습니다. 관리자가 출석부를 먼저 생성해야 합니다.</p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800">로그인 후 빈 화면이 보여요</h3>
                <p className="mt-2 text-slate-600">→ 계정에 역할(관리자/셀장)이 설정되지 않았습니다. 관리자에게 문의하세요.</p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800">셀장인데 다른 셀이 보여요</h3>
                <p className="mt-2 text-slate-600">→ 계정에 연결된 셀 정보가 잘못되었습니다. 관리자에게 계정 설정 확인을 요청하세요.</p>
              </div>
            </div>

            {/* Bug Report Link */}
            <div className="mt-6 rounded-lg bg-slate-100 p-4 text-center">
              <p className="text-sm text-slate-600">해결되지 않는 문제가 있나요?</p>
              <Link
                href="/bugs"
                className="mt-2 inline-block rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                버그 리포트 남기기
              </Link>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/" className="text-sky-600 hover:underline">홈으로</Link>
          <Link href="/bugs" className="text-sky-600 hover:underline">버그 리포트</Link>
          <Link href="/cells" className="text-sky-600 hover:underline">셀 배치표</Link>
          <Link href="/login" className="text-sky-600 hover:underline">로그인</Link>
        </div>
      </div>
    </main>
  );
}
