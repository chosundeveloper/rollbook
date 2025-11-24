import { getCellsWithMembers } from "@/lib/cell-store";

const ROLE_LABEL: Record<string, string> = {
  leader: "셀장",
  subleader: "부셀장",
  member: "셀원",
};

export const dynamic = "force-dynamic";

export default async function CellsPage() {
  const cells = await getCellsWithMembers();

  return (
    <main className="min-h-screen bg-slate-100 pb-12 pt-10">
      <section className="mx-auto max-w-5xl space-y-6 px-4">
        <header>
          <h1 className="text-3xl font-semibold text-slate-900">셀 배치표</h1>
          <p className="mt-2 text-sm text-slate-600">등록된 셀과 셀장/부셀장/셀원 구성을 한눈에 확인하세요.</p>
        </header>

        <div className="space-y-6">
          {cells.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
              아직 등록된 셀이 없습니다. 데이터를 추가하면 이곳에 표시됩니다.
            </p>
          ) : (
            cells.map((cell) => (
              <article key={cell.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{cell.number}셀 - {cell.name}</h2>
                  </div>
                  <span className="text-sm text-slate-600">총 {cell.roster.length}명</span>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[320px] text-left text-sm text-slate-700">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-slate-600">
                        <th className="pb-2">이름</th>
                        <th className="pb-2">교회 직분</th>
                        <th className="pb-2">셀 내 역할</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cell.roster.map((entry, index) => (
                        <tr key={`${cell.id}-${entry.member?.id ?? index}`} className="border-t border-slate-100">
                          <td className="py-2 font-medium text-slate-900">{entry.member?.name ?? "미등록"}</td>
                          <td className="py-2 text-slate-600">{entry.member?.role ?? "-"}</td>
                          <td className="py-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {ROLE_LABEL[entry.role] ?? entry.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
