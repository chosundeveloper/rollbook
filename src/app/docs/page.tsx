import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-12 pt-10">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">사용법 가이드</h1>
            <p className="text-sm text-slate-600">2청년부 출석부 시스템 완벽 가이드</p>
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
            <span className="text-2xl">🚀</span> 빠른 시작 (3단계)
          </h2>
          <div className="mt-4 space-y-3 text-sm text-sky-900">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">1</span>
              <p>관리자에게 <strong>아이디/비밀번호</strong>를 받으세요</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">2</span>
              <p><Link href="/login" className="font-semibold underline">로그인 페이지</Link>에서 로그인하세요</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">3</span>
              <p>역할에 따라 자동으로 페이지가 이동됩니다 (관리자 → /admin, 셀장 → /cell)</p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-800">📑 목차</h2>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <li><a href="#overview" className="flex items-center gap-2 text-slate-600 hover:text-sky-600 hover:underline"><span>🗺️</span> 전체 시스템 개요</a></li>
            <li><a href="#weekly-flow" className="flex items-center gap-2 text-violet-600 hover:underline"><span>📅</span> 매주 출석 체크 플로우</a></li>
            <li><a href="#prayer-flow" className="flex items-center gap-2 text-amber-600 hover:underline"><span>🙏</span> 기도회 체크 플로우</a></li>
            <li><a href="#cell-leader" className="flex items-center gap-2 text-emerald-600 hover:underline"><span>👥</span> 셀장 상세 가이드</a></li>
            <li><a href="#admin" className="flex items-center gap-2 text-sky-600 hover:underline"><span>⚙️</span> 관리자 상세 가이드</a></li>
            <li><a href="#faq" className="flex items-center gap-2 text-rose-600 hover:underline"><span>❓</span> 자주 묻는 질문</a></li>
          </ul>
        </nav>

        {/* Content */}
        <div className="space-y-8">

          {/* System Overview */}
          <section id="overview" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">🗺️</span>
              전체 시스템 개요
            </h2>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-700 mb-4">이 시스템은 무엇인가요?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                2청년부 출석부 관리 시스템은 <strong>주일 예배 출석</strong>과 <strong>기도회 참석</strong>을
                효율적으로 관리하기 위한 웹 애플리케이션입니다. 관리자와 셀장이 역할에 맞게 사용합니다.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-700 mb-4">사용자 역할</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                  <h4 className="font-semibold text-sky-800">👑 관리자 (Admin)</h4>
                  <ul className="mt-2 space-y-1 text-sm text-sky-900">
                    <li>• 교인 등록/수정/삭제</li>
                    <li>• 셀 생성 및 셀원 배정</li>
                    <li>• 셀장 계정 생성</li>
                    <li>• <strong>출석부 생성</strong> (필수!)</li>
                    <li>• 기도회 일정 생성</li>
                    <li>• 전체 현황 조회 및 PDF 다운로드</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <h4 className="font-semibold text-emerald-800">👥 셀장 (Leader)</h4>
                  <ul className="mt-2 space-y-1 text-sm text-emerald-900">
                    <li>• 자기 셀원의 출석 체크</li>
                    <li>• 자기 셀원의 기도회 참석 체크</li>
                    <li>• 메모 기록</li>
                    <li>• 방문자 추가 (해당 날짜)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-700 mb-4">전체 흐름 한눈에 보기</h3>
              <div className="rounded-lg bg-slate-50 p-4 overflow-x-auto">
                <div className="min-w-[500px] text-sm font-mono text-slate-700">
                  <div className="text-center mb-4 font-bold text-slate-800">[ 초기 설정 - 처음 한 번만 ]</div>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="rounded bg-sky-100 px-2 py-1">교인 등록</span>
                    <span>→</span>
                    <span className="rounded bg-sky-100 px-2 py-1">셀 생성</span>
                    <span>→</span>
                    <span className="rounded bg-sky-100 px-2 py-1">셀원 배정</span>
                    <span>→</span>
                    <span className="rounded bg-sky-100 px-2 py-1">셀장 계정 생성</span>
                  </div>

                  <div className="text-center mb-4 font-bold text-slate-800">[ 매주 반복 ]</div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="rounded bg-violet-100 px-3 py-1">관리자: 출석부 생성</span>
                    <span>↓</span>
                    <span className="rounded bg-emerald-100 px-3 py-1">셀장들: 출석 체크 → 제출</span>
                    <span>↓</span>
                    <span className="rounded bg-violet-100 px-3 py-1">관리자: 현황 확인 → PDF 다운로드</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Weekly Attendance Flow */}
          <section id="weekly-flow" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-violet-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-lg">📅</span>
              매주 출석 체크 플로우
            </h2>

            <p className="mt-4 text-sm text-slate-600">
              매주 주일마다 반복되는 출석 체크 과정입니다. <strong>반드시 순서대로</strong> 진행해야 합니다!
            </p>

            <div className="mt-6 relative">
              {/* Timeline */}
              <div className="absolute left-6 top-0 h-full w-0.5 bg-violet-200" />

              <div className="space-y-8">
                {/* Step 1 */}
                <div className="relative flex gap-4">
                  <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white font-bold shadow-lg">1</div>
                  <div className="flex-1 rounded-lg border border-violet-200 bg-violet-50 p-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">관리자</span>
                      <h3 className="font-semibold text-violet-800">출석부 생성</h3>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-violet-900">
                      <p className="font-medium">📍 경로: /admin → 출석부 관리</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>로그인 후 관리자 페이지로 이동</li>
                        <li>우측 메뉴에서 <strong>&quot;출석부 관리&quot;</strong> 클릭</li>
                        <li>예배 날짜 선택 (기본값: 이번 주일)</li>
                        <li>제목 입력 (선택사항, 예: &quot;창립기념주일&quot;)</li>
                        <li><strong>&quot;출석부 생성&quot;</strong> 버튼 클릭</li>
                      </ol>
                    </div>
                    <div className="mt-3 rounded bg-amber-100 p-2 text-xs text-amber-800">
                      ⚠️ <strong>중요:</strong> 출석부를 생성하지 않으면 셀장들이 출석 체크를 할 수 없습니다!
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex gap-4">
                  <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white font-bold shadow-lg">2</div>
                  <div className="flex-1 rounded-lg border border-violet-200 bg-violet-50 p-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">셀장</span>
                      <h3 className="font-semibold text-violet-800">출석 체크</h3>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-violet-900">
                      <p className="font-medium">📍 경로: /cell (로그인 후 자동 이동)</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>셀장 계정으로 로그인</li>
                        <li>상단 드롭다운에서 <strong>출석부 날짜</strong> 선택</li>
                        <li>각 셀원의 출석 상태 선택:
                          <div className="flex gap-2 mt-1 ml-4">
                            <span className="rounded bg-emerald-200 px-2 py-0.5 text-xs">오프라인</span>
                            <span className="rounded bg-sky-200 px-2 py-0.5 text-xs">온라인</span>
                            <span className="rounded bg-rose-200 px-2 py-0.5 text-xs">결석</span>
                          </div>
                        </li>
                        <li>필요시 메모 입력</li>
                        <li><strong>&quot;출석 제출&quot;</strong> 버튼 클릭</li>
                      </ol>
                    </div>
                    <div className="mt-3 rounded bg-amber-100 p-2 text-xs text-amber-800">
                      ⚠️ <strong>주의:</strong> 저장 버튼을 누르지 않으면 데이터가 사라집니다!
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex gap-4">
                  <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white font-bold shadow-lg">3</div>
                  <div className="flex-1 rounded-lg border border-violet-200 bg-violet-50 p-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">관리자</span>
                      <h3 className="font-semibold text-violet-800">현황 확인 및 다운로드</h3>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-violet-900">
                      <p className="font-medium">📍 경로: /admin</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>관리자 페이지에서 전체 출석 현황 확인</li>
                        <li>각 셀별 제출 현황 확인 (제출완료/미제출)</li>
                        <li>필요시 <strong>&quot;PDF 다운로드&quot;</strong> 버튼으로 출력용 파일 생성</li>
                      </ol>
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
              기도회 체크 플로우
            </h2>

            <p className="mt-4 text-sm text-slate-600">
              특별새벽기도회, 금요기도회 등 기도회 참석을 관리하는 과정입니다.
            </p>

            <div className="mt-6 relative">
              {/* Timeline */}
              <div className="absolute left-6 top-0 h-full w-0.5 bg-amber-200" />

              <div className="space-y-8">
                {/* Step 1 */}
                <div className="relative flex gap-4">
                  <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white font-bold shadow-lg">1</div>
                  <div className="flex-1 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">관리자</span>
                      <h3 className="font-semibold text-amber-800">기도회 일정 생성</h3>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-amber-900">
                      <p className="font-medium">📍 경로: /admin → 기도회 관리</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>기도회 이름 입력 (예: &quot;11월 특별새벽기도회&quot;)</li>
                        <li>시작일과 종료일 선택</li>
                        <li>시간대 추가 (예: 새벽 5:30, 저녁 8:00)</li>
                        <li><strong>&quot;기도회 생성&quot;</strong> 버튼 클릭</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex gap-4">
                  <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white font-bold shadow-lg">2</div>
                  <div className="flex-1 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">셀장</span>
                      <h3 className="font-semibold text-amber-800">참석 체크</h3>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-amber-900">
                      <p className="font-medium">📍 경로: /cell → 드롭다운에서 기도회 선택</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>상단 드롭다운에서 <strong>기도회 일정</strong> 선택</li>
                        <li>기도회 페이지로 자동 이동</li>
                        <li>셀원별로 참석한 날짜와 시간대에 체크 ✓</li>
                        <li><strong>&quot;저장&quot;</strong> 버튼 클릭</li>
                      </ol>
                    </div>
                    <div className="mt-3 rounded bg-slate-100 p-2 text-xs text-slate-700">
                      💡 <strong>팁:</strong> 표 형태로 날짜(가로) × 시간대(세로)가 표시됩니다. 해당 칸을 클릭하면 체크됩니다.
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex gap-4">
                  <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white font-bold shadow-lg">3</div>
                  <div className="flex-1 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">관리자</span>
                      <h3 className="font-semibold text-amber-800">전체 현황 조회</h3>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-amber-900">
                      <p className="font-medium">📍 경로: /admin → 기도회 관리 → 기도회 클릭</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>기도회 목록에서 해당 기도회 클릭</li>
                        <li>전체 셀원의 참석 현황을 한눈에 확인</li>
                        <li>날짜별, 시간대별 참석 통계 확인</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cell Leader Guide */}
          <section id="cell-leader" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-emerald-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg">👥</span>
              셀장 상세 가이드
            </h2>

            <div className="mt-6 space-y-6">
              {/* Login */}
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <h3 className="font-semibold text-emerald-800">🔐 로그인하기</h3>
                <div className="mt-2 space-y-2 text-sm text-emerald-900">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>웹사이트 접속</li>
                    <li>관리자에게 받은 <strong>아이디/비밀번호</strong> 입력</li>
                    <li>&quot;로그인&quot; 버튼 클릭</li>
                    <li>자동으로 셀 출석 페이지(/cell)로 이동</li>
                  </ol>
                </div>
              </div>

              {/* Attendance Check */}
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <h3 className="font-semibold text-emerald-800">📋 출석 체크하기</h3>
                <div className="mt-2 space-y-3 text-sm text-emerald-900">
                  <div>
                    <p className="font-medium">1단계: 출석부 선택</p>
                    <p className="ml-4 text-emerald-700">화면 상단의 드롭다운에서 날짜를 선택합니다.</p>
                    <p className="ml-4 text-emerald-700">날짜가 안 보이면? → 관리자가 출석부를 아직 생성하지 않은 것입니다.</p>
                  </div>
                  <div>
                    <p className="font-medium">2단계: 상태 선택</p>
                    <p className="ml-4 text-emerald-700">각 셀원 옆의 버튼을 클릭하여 상태를 선택합니다.</p>
                    <div className="ml-4 mt-1 flex gap-2">
                      <span className="rounded bg-emerald-200 px-2 py-1 text-xs">오프라인 = 현장 예배</span>
                      <span className="rounded bg-sky-200 px-2 py-1 text-xs">온라인 = 영상 예배</span>
                      <span className="rounded bg-rose-200 px-2 py-1 text-xs">결석 = 불참</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">3단계: 메모 (선택사항)</p>
                    <p className="ml-4 text-emerald-700">특이사항이 있으면 메모란에 입력합니다.</p>
                    <p className="ml-4 text-emerald-700">예: &quot;출장 중&quot;, &quot;다음 주 휴가&quot;</p>
                  </div>
                  <div>
                    <p className="font-medium">4단계: 저장</p>
                    <p className="ml-4 text-emerald-700"><strong>&quot;출석 제출&quot;</strong> 버튼을 반드시 클릭하세요!</p>
                  </div>
                </div>
              </div>

              {/* Prayer Check */}
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <h3 className="font-semibold text-emerald-800">🙏 기도회 참석 체크하기</h3>
                <div className="mt-2 space-y-3 text-sm text-emerald-900">
                  <div>
                    <p className="font-medium">1단계: 기도회 선택</p>
                    <p className="ml-4 text-emerald-700">드롭다운에서 &quot;기도회&quot; 그룹의 일정을 선택합니다.</p>
                  </div>
                  <div>
                    <p className="font-medium">2단계: 체크표 작성</p>
                    <p className="ml-4 text-emerald-700">표에서 셀원이 참석한 날짜/시간대 칸을 클릭하여 체크합니다.</p>
                    <p className="ml-4 text-emerald-700">✓ 표시가 나타나면 체크 완료입니다.</p>
                  </div>
                  <div>
                    <p className="font-medium">3단계: 저장</p>
                    <p className="ml-4 text-emerald-700"><strong>&quot;저장&quot;</strong> 버튼 클릭</p>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-amber-800">
                  <span>⚠️</span> 셀장 필독사항
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-amber-900">
                  <li>• <strong>저장 버튼</strong>을 누르지 않으면 입력한 내용이 모두 사라집니다!</li>
                  <li>• 출석부가 보이지 않으면 관리자에게 <strong>출석부 생성</strong>을 요청하세요.</li>
                  <li>• 셀원이 보이지 않으면 관리자에게 <strong>셀원 배정</strong>을 요청하세요.</li>
                  <li>• 문제가 생기면 <Link href="/bugs" className="underline">버그 리포트</Link>를 남겨주세요.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Admin Guide */}
          <section id="admin" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-sky-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-lg">⚙️</span>
              관리자 상세 가이드
            </h2>

            <div className="mt-6 space-y-6">
              {/* Initial Setup */}
              <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
                <h3 className="font-semibold text-sky-800">🔧 초기 설정 (처음 한 번만)</h3>
                <p className="mt-2 text-sm text-sky-700">시스템을 처음 사용할 때 아래 순서대로 설정합니다.</p>

                <div className="mt-4 space-y-4">
                  <div className="rounded bg-white p-3 border border-sky-200">
                    <p className="font-medium text-sky-800">Step 1: 교인 등록</p>
                    <p className="text-sm text-sky-700 mt-1">📍 /admin → 교인 관리</p>
                    <ul className="mt-2 text-sm text-sky-600 space-y-1 ml-4">
                      <li>• 이름 (필수)</li>
                      <li>• 출생년도 (선택)</li>
                      <li>• 직분: 셀장/셀원 선택 (셀장으로 설정해야 셀 생성 시 선택 가능)</li>
                      <li>• 등록일 (선택)</li>
                    </ul>
                  </div>

                  <div className="rounded bg-white p-3 border border-sky-200">
                    <p className="font-medium text-sky-800">Step 2: 셀 생성</p>
                    <p className="text-sm text-sky-700 mt-1">📍 /admin → 셀 관리</p>
                    <ul className="mt-2 text-sm text-sky-600 space-y-1 ml-4">
                      <li>• 셀장을 선택하면 자동으로 &quot;[이름]셀&quot;로 생성됩니다.</li>
                      <li>• 예: 홍길동을 선택하면 → &quot;홍길동셀&quot; 생성</li>
                    </ul>
                  </div>

                  <div className="rounded bg-white p-3 border border-sky-200">
                    <p className="font-medium text-sky-800">Step 3: 셀원 배정</p>
                    <p className="text-sm text-sky-700 mt-1">📍 /admin → 셀 관리 → 각 셀에서 &quot;셀원 추가&quot;</p>
                    <ul className="mt-2 text-sm text-sky-600 space-y-1 ml-4">
                      <li>• 생성된 셀을 클릭</li>
                      <li>• &quot;셀원 추가&quot; 드롭다운에서 교인 선택</li>
                      <li>• 선택 즉시 배정됨</li>
                    </ul>
                  </div>

                  <div className="rounded bg-white p-3 border border-sky-200">
                    <p className="font-medium text-sky-800">Step 4: 셀장 계정 생성</p>
                    <p className="text-sm text-sky-700 mt-1">📍 /admin → 계정 관리</p>
                    <ul className="mt-2 text-sm text-sky-600 space-y-1 ml-4">
                      <li>• 아이디 입력</li>
                      <li>• 비밀번호 입력</li>
                      <li>• 역할: &quot;셀장&quot; 선택</li>
                      <li>• 연결할 셀 선택</li>
                      <li>• &quot;계정 생성&quot; 클릭</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Weekly Tasks */}
              <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
                <h3 className="font-semibold text-sky-800">📅 매주 할 일</h3>

                <div className="mt-4 space-y-4">
                  <div className="rounded bg-white p-3 border border-sky-200">
                    <p className="font-medium text-sky-800">출석부 생성 (매주 예배 전)</p>
                    <p className="text-sm text-sky-700 mt-1">📍 /admin → 출석부 관리</p>
                    <ol className="mt-2 text-sm text-sky-600 list-decimal list-inside ml-2">
                      <li>예배 날짜 선택 (기본값: 이번 주일)</li>
                      <li>제목 입력 (선택사항)</li>
                      <li>&quot;출석부 생성&quot; 클릭</li>
                    </ol>
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded p-2">
                      ⚠️ 이 작업을 하지 않으면 셀장들이 출석 체크를 할 수 없습니다!
                    </p>
                  </div>

                  <div className="rounded bg-white p-3 border border-sky-200">
                    <p className="font-medium text-sky-800">출석 현황 확인 (예배 후)</p>
                    <p className="text-sm text-sky-700 mt-1">📍 /admin</p>
                    <ul className="mt-2 text-sm text-sky-600 space-y-1 ml-4">
                      <li>• 전체 출석 현황 확인</li>
                      <li>• 미제출 셀 확인 및 독려</li>
                      <li>• PDF 다운로드로 보고서 생성</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Menu Reference */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-800">📂 관리 메뉴 총정리</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-200">
                        <th className="border border-slate-300 px-3 py-2 text-left">메뉴</th>
                        <th className="border border-slate-300 px-3 py-2 text-left">경로</th>
                        <th className="border border-slate-300 px-3 py-2 text-left">기능</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-medium">출석부 관리</td>
                        <td className="border border-slate-300 px-3 py-2 font-mono text-xs">/admin/sessions</td>
                        <td className="border border-slate-300 px-3 py-2">날짜별 출석부 생성/삭제</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-medium">기도회 관리</td>
                        <td className="border border-slate-300 px-3 py-2 font-mono text-xs">/admin/prayer</td>
                        <td className="border border-slate-300 px-3 py-2">기도회 일정 생성, 현황 조회</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-medium">교인 관리</td>
                        <td className="border border-slate-300 px-3 py-2 font-mono text-xs">/admin/members</td>
                        <td className="border border-slate-300 px-3 py-2">교인 등록/수정/삭제</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-medium">셀 관리</td>
                        <td className="border border-slate-300 px-3 py-2 font-mono text-xs">/admin/cells</td>
                        <td className="border border-slate-300 px-3 py-2">셀 생성/삭제, 셀원 배정</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-medium">계정 관리</td>
                        <td className="border border-slate-300 px-3 py-2 font-mono text-xs">/admin/users</td>
                        <td className="border border-slate-300 px-3 py-2">로그인 계정 생성/삭제</td>
                      </tr>
                    </tbody>
                  </table>
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
                    출석 체크가 안 돼요 / 출석부가 안 보여요
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </span>
                </summary>
                <div className="border-t border-slate-200 p-4 text-sm text-slate-700">
                  <p><strong>원인:</strong> 해당 날짜의 출석부가 생성되지 않았습니다.</p>
                  <p className="mt-2"><strong>해결:</strong></p>
                  <ul className="ml-4 mt-1 list-disc list-inside">
                    <li>셀장 → 관리자에게 출석부 생성 요청</li>
                    <li>관리자 → /admin → 출석부 관리 → 출석부 생성</li>
                  </ul>
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
                  <p className="mt-2"><strong>해결:</strong></p>
                  <ul className="ml-4 mt-1 list-disc list-inside">
                    <li>관리자 → /admin/cells → 해당 셀에서 셀원 추가</li>
                  </ul>
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
                  <p className="mt-2"><strong>해결:</strong></p>
                  <ul className="ml-4 mt-1 list-disc list-inside">
                    <li>관리자 → /admin/prayer → 기도회 생성</li>
                  </ul>
                </div>
              </details>

              <details className="group rounded-lg border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer list-none p-4 font-medium text-slate-800">
                  <span className="flex items-center justify-between">
                    셀장 계정이 필요해요
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </span>
                </summary>
                <div className="border-t border-slate-200 p-4 text-sm text-slate-700">
                  <p>관리자에게 요청하세요.</p>
                  <p className="mt-2"><strong>관리자 작업:</strong></p>
                  <ol className="ml-4 mt-1 list-decimal list-inside">
                    <li>/admin/users 접속</li>
                    <li>아이디, 비밀번호 입력</li>
                    <li>역할: &quot;셀장&quot; 선택</li>
                    <li>연결할 셀 선택</li>
                    <li>계정 생성 클릭</li>
                  </ol>
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
                  <p>관리자에게 연락하여 계정을 삭제하고 새로 생성받으세요.</p>
                  <p className="mt-2 text-xs text-slate-500">(현재 비밀번호 변경 기능은 없습니다)</p>
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

              <details className="group rounded-lg border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer list-none p-4 font-medium text-slate-800">
                  <span className="flex items-center justify-between">
                    &quot;출석 정보를 불러오지 못했습니다&quot; 에러
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </span>
                </summary>
                <div className="border-t border-slate-200 p-4 text-sm text-slate-700">
                  <p><strong>원인:</strong> 서버 연결 문제이거나 해당 날짜의 데이터가 없습니다.</p>
                  <p className="mt-2"><strong>해결:</strong></p>
                  <ul className="ml-4 mt-1 list-disc list-inside">
                    <li>페이지 새로고침</li>
                    <li>출석부가 생성되어 있는지 확인</li>
                    <li>관리자에게 문의</li>
                  </ul>
                </div>
              </details>
            </div>

            {/* Bug Report Link */}
            <div className="mt-6 rounded-lg bg-slate-100 p-4 text-center">
              <p className="text-sm text-slate-600">해결되지 않는 문제가 있나요?</p>
              <Link
                href="/bugs"
                className="mt-2 inline-block rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
              >
                🐛 버그 리포트 남기기
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
