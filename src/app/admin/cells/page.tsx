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
    <section className="mx-auto max-w-4xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">셀 관리</h1>
          <p className="text-sm text-slate-600">셀장을 선택하면 셀이 자동 생성됩니다.</p>
        </div>
        <Link
          href="/admin"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-500"
        >
          홈으로
        </Link>
      </header>

      {/* Messages */}
      {(error || message) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-rose-300 bg-rose-50 text-rose-700"
              : "border-emerald-300 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}

      {/* Create Cell Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">새 셀 생성</h2>
        <p className="text-sm text-slate-600">셀장을 선택하면 &quot;OOO셀&quot;로 자동 생성됩니다.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="flex-1 text-sm text-slate-700">
            <span className="mb-1 block font-medium">셀장 선택 *</span>
            <select
              value={newCellLeader}
              onChange={(e) => setNewCellLeader(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="">셀장 선택...</option>
              {availableLeaders.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.birthYear ? `(${m.birthYear}년생)` : ""}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:flex sm:flex-col sm:justify-end">
            <button
              type="button"
              onClick={handleCreateCell}
              disabled={creating || !newCellLeader}
              className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "생성 중..." : "셀 생성"}
            </button>
          </div>
        </div>
        {availableLeaders.length === 0 && (
          <p className="mt-2 text-sm text-amber-600">
            셀장으로 배정 가능한 멤버가 없습니다. 교인 관리에서 역할이 &quot;셀장&quot;인 멤버를 등록하세요.
          </p>
        )}
      </div>

      {/* Unassigned Members Info */}
      {unassignedMembers.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          미배정 멤버: {unassignedMembers.map((m) => m.name).join(", ")} ({unassignedMembers.length}명)
        </div>
      )}

      {/* Cell List */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">셀 목록</h2>
          <span className="text-sm text-slate-600">{cells.length}개</span>
        </div>

        {cells.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">생성된 셀이 없습니다.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {cells.map((cell) => {
              const leader = cell.roster.find((r) => r.role === "leader");
              const cellMembers = cell.roster.filter((r) => r.role !== "leader");

              return (
                <div key={cell.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {cell.number}셀 - {cell.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        셀장: {leader?.member?.name || "없음"} / 셀원: {cellMembers.length}명
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCell(cell.id, cell.name)}
                      className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-600 transition hover:border-rose-500"
                    >
                      삭제
                    </button>
                  </div>

                  {/* Members */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">셀원 목록</span>
                      <button
                        type="button"
                        onClick={() => setAssigningCell(assigningCell === cell.id ? null : cell.id)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:border-slate-500"
                      >
                        {assigningCell === cell.id ? "취소" : "셀원 추가"}
                      </button>
                    </div>

                    {assigningCell === cell.id && (
                      <div className="mt-2 flex gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
                        <select
                          value={selectedMember}
                          onChange={(e) => setSelectedMember(e.target.value)}
                          className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
                        >
                          <option value="">멤버 선택...</option>
                          {members
                            .filter((m) => m.role !== "leader" && !cell.roster.some((r) => r.member?.id === m.id))
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} {assignedMemberIds.has(m.id) ? "(다른 셀)" : ""}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAddMember(cell.id)}
                          className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500"
                        >
                          추가
                        </button>
                      </div>
                    )}

                    <ul className="mt-2 space-y-1">
                      {cell.roster.map((entry) => (
                        <li
                          key={entry.member?.id}
                          className="flex items-center justify-between rounded-lg border border-slate-50 px-3 py-2"
                        >
                          <div>
                            <span className="font-medium text-slate-700">
                              {entry.member?.name || "미등록"}
                            </span>
                            <span
                              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                entry.role === "leader"
                                  ? "bg-sky-100 text-sky-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {CELL_ROLE_LABEL[entry.role]}
                            </span>
                            {entry.member?.birthYear && (
                              <span className="ml-2 text-xs text-slate-600">
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
                              className="text-xs text-rose-500 hover:text-rose-600"
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
