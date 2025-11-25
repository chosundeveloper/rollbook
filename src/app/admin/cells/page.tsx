"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Member, CellRole } from "@/types/attendance";
import { AUTH_DISABLED } from "@/lib/auth";

interface CellRosterEntry {
  role: CellRole;
  member?: Member;
}

interface CellResponse {
  id: string;
  number: number;
  name: string;
  leaderId: string;
  roster: CellRosterEntry[];
}

const CELL_ROLE_LABEL: Record<CellRole, string> = {
  leader: "셀장",
  subleader: "부셀장",
  member: "셀원",
};

export default function AdminCellsPage() {
  const authEnabled = !AUTH_DISABLED;

  const [cells, setCells] = useState<CellResponse[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [newCellLeader, setNewCellLeader] = useState("");
  const [creating, setCreating] = useState(false);

  // Member assignment states
  const [assigningCell, setAssigningCell] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState("");

  const handleAuthFailure = useCallback(() => {
    if (!authEnabled) return;
    window.location.href = "/login";
  }, [authEnabled]);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cellsRes, membersRes] = await Promise.all([
        fetch("/api/cells"),
        fetch("/api/members"),
      ]);

      if (authEnabled && (cellsRes.status === 401 || membersRes.status === 401)) {
        handleAuthFailure();
        return;
      }

      if (!cellsRes.ok) throw new Error("셀 정보를 불러오지 못했습니다.");
      if (!membersRes.ok) throw new Error("멤버 정보를 불러오지 못했습니다.");

      const cellsData = await cellsRes.json();
      const membersData = await membersRes.json();

      setCells(cellsData.cells as CellResponse[]);
      setMembers(membersData.members as Member[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [authEnabled, handleAuthFailure]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 셀장으로 사용 가능한 멤버 (role이 leader이고 아직 다른 셀의 셀장이 아닌)
  const usedLeaderIds = new Set(cells.map((c) => c.leaderId));
  const availableLeaders = members.filter(
    (m) => m.role === "leader" && !usedLeaderIds.has(m.id)
  );

  const handleCreateCell = useCallback(async () => {
    if (!newCellLeader) {
      setError("셀장을 선택해 주세요.");
      return;
    }

    const leader = members.find((m) => m.id === newCellLeader);
    if (!leader) {
      setError("선택한 셀장을 찾을 수 없습니다.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/cells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaderId: newCellLeader,
          leaderName: leader.name,
        }),
      });

      if (authEnabled && res.status === 401) {
        handleAuthFailure();
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "셀 생성 실패");
      }

      setMessage("셀이 생성되었습니다.");
      setNewCellLeader("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "셀 생성 오류");
    } finally {
      setCreating(false);
    }
  }, [authEnabled, handleAuthFailure, loadData, members, newCellLeader]);

  const handleDeleteCell = useCallback(async (cellId: string, cellName: string) => {
    if (!confirm(`"${cellName}"을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/cells?id=${cellId}`, { method: "DELETE" });

      if (authEnabled && res.status === 401) {
        handleAuthFailure();
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "셀 삭제 실패");
      }

      setMessage("셀이 삭제되었습니다.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "셀 삭제 오류");
    }
  }, [authEnabled, handleAuthFailure, loadData]);

  const handleAddMember = useCallback(async (cellId: string) => {
    if (!selectedMember) {
      setError("멤버를 선택해 주세요.");
      return;
    }

    try {
      const res = await fetch("/api/cells/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cellId,
          memberId: selectedMember,
          role: "member",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "멤버 배정 실패");
      }

      setMessage("셀원이 추가되었습니다.");
      setSelectedMember("");
      setAssigningCell(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "멤버 배정 오류");
    }
  }, [loadData, selectedMember]);

  const handleRemoveMember = useCallback(async (cellId: string, memberId: string, memberName: string, isLeader: boolean) => {
    if (isLeader) {
      setError("셀장은 제외할 수 없습니다. 셀을 삭제하세요.");
      return;
    }
    if (!confirm(`"${memberName}"을(를) 셀에서 제외하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/cells/members?cellId=${cellId}&memberId=${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "멤버 제외 실패");
      }

      setMessage("셀원이 제외되었습니다.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "멤버 제외 오류");
    }
  }, [loadData]);

  const handleLogout = useCallback(async () => {
    if (!authEnabled) return;
    await fetch("/api/session", { method: "DELETE" });
    handleAuthFailure();
  }, [authEnabled, handleAuthFailure]);

  // 미배정 멤버
  const assignedMemberIds = new Set(
    cells.flatMap((c) => c.roster.map((r) => r.member?.id).filter(Boolean))
  );
  const unassignedMembers = members.filter((m) => !assignedMemberIds.has(m.id));

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
        <p className="text-sm text-slate-600">데이터를 불러오는 중...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-5 px-4 pb-6 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">셀 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">셀장을 선택하면 셀이 자동 생성됩니다</p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200 active:scale-95"
        >
          ← 홈
        </Link>
      </header>

      {/* Messages */}
      {(error || message) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            error
              ? "bg-rose-50 text-rose-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}

      {/* Create Cell Form */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <h2 className="text-base font-bold text-slate-800 mb-1">새 셀 생성</h2>
        <p className="text-xs text-slate-500 mb-4">셀장을 선택하면 &quot;OOO셀&quot;로 자동 생성됩니다</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">셀장 선택</label>
            <select
              value={newCellLeader}
              onChange={(e) => setNewCellLeader(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-violet-500 focus:bg-white focus:outline-none transition"
            >
              <option value="">셀장 선택...</option>
              {availableLeaders.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.birthYear ? `(${m.birthYear}년생)` : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleCreateCell}
            disabled={creating || !newCellLeader}
            className="w-full rounded-xl bg-violet-500 py-3 text-sm font-semibold text-white transition hover:bg-violet-600 active:scale-[0.98] disabled:opacity-60"
          >
            {creating ? "생성 중..." : "셀 생성"}
          </button>
        </div>
        {availableLeaders.length === 0 && (
          <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            셀장으로 배정 가능한 멤버가 없습니다. 교인 관리에서 역할이 &quot;셀장&quot;인 멤버를 등록하세요.
          </p>
        )}
      </div>

      {/* Unassigned Members Info */}
      {unassignedMembers.length > 0 && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <span className="font-medium">미배정 멤버:</span> {unassignedMembers.map((m) => m.name).join(", ")} ({unassignedMembers.length}명)
        </div>
      )}

      {/* Cell List */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">셀 목록</h2>
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">{cells.length}개</span>
        </div>

        {cells.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-8 text-center">
            <div className="text-4xl mb-3">🏠</div>
            <p className="text-slate-600 font-medium">셀이 없습니다</p>
            <p className="text-sm text-slate-400 mt-1">위에서 새 셀을 만들어 보세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cells.map((cell) => {
              const leader = cell.roster.find((r) => r.role === "leader");
              const cellMembers = cell.roster.filter((r) => r.role !== "leader");

              return (
                <div key={cell.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600 font-bold">
                        {cell.number}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{cell.name}</h3>
                        <p className="text-xs text-slate-500">
                          셀장: {leader?.member?.name || "없음"} · 셀원: {cellMembers.length}명
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCell(cell.id, cell.name)}
                      className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-200 active:scale-95"
                    >
                      삭제
                    </button>
                  </div>

                  {/* Members */}
                  <div className="rounded-lg bg-white p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500">셀원 목록</span>
                      <button
                        type="button"
                        onClick={() => setAssigningCell(assigningCell === cell.id ? null : cell.id)}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                      >
                        {assigningCell === cell.id ? "취소" : "+ 추가"}
                      </button>
                    </div>

                    {assigningCell === cell.id && (
                      <div className="mb-3 flex gap-2 rounded-lg bg-slate-50 p-2">
                        <select
                          value={selectedMember}
                          onChange={(e) => setSelectedMember(e.target.value)}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
                        >
                          <option value="">멤버 선택...</option>
                          {members
                            .filter((m) => m.role !== "leader" && !cell.roster.some((r) => r.member?.id === m.id) && !assignedMemberIds.has(m.id))
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAddMember(cell.id)}
                          className="rounded-lg bg-violet-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-600 active:scale-95"
                        >
                          추가
                        </button>
                      </div>
                    )}

                    <ul className="space-y-1.5">
                      {cell.roster.map((entry) => (
                        <li
                          key={entry.member?.id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-700 text-sm">
                              {entry.member?.name || "미등록"}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                entry.role === "leader"
                                  ? "bg-violet-100 text-violet-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {CELL_ROLE_LABEL[entry.role]}
                            </span>
                            {entry.member?.birthYear && (
                              <span className="text-xs text-slate-400">
                                {entry.member.birthYear}년생
                              </span>
                            )}
                          </div>
                          {entry.role !== "leader" && (
                            <button
                              type="button"
                              onClick={() =>
                                entry.member &&
                                handleRemoveMember(cell.id, entry.member.id, entry.member.name, entry.role === "leader")
                              }
                              className="text-xs text-rose-500 hover:text-rose-600 font-medium"
                            >
                              제외
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
