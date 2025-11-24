"use client";

import { useCallback, useEffect, useState } from "react";
import type { Member, CellRole } from "@/types/attendance";
import { AUTH_DISABLED } from "@/lib/auth";

interface CellRosterEntry {
  role: CellRole;
  member?: Member;
}

interface CellResponse {
  id: string;
  name: string;
  description?: string;
  roster: CellRosterEntry[];
}

const CELL_ROLE_LABEL: Record<CellRole, string> = {
  leader: "셀장",
  subleader: "부셀장",
  member: "셀원",
};

const CELL_ROLES: CellRole[] = ["leader", "subleader", "member"];

export default function AdminCellsPage() {
  const authEnabled = !AUTH_DISABLED;

  const [cells, setCells] = useState<CellResponse[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [newCellName, setNewCellName] = useState("");
  const [newCellLeader, setNewCellLeader] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit states
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Member assignment states
  const [assigningCell, setAssigningCell] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedRole, setSelectedRole] = useState<CellRole>("member");

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

  const handleCreateCell = useCallback(async () => {
    if (!newCellName.trim()) {
      setError("셀 이름을 입력해 주세요.");
      return;
    }
    if (!newCellLeader) {
      setError("셀장을 선택해 주세요.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      // 1. 셀 생성
      const res = await fetch("/api/cells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCellName.trim(),
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

      const cellData = await res.json();
      const newCellId = cellData.cell.id;

      // 2. 셀장 배정
      const leaderRes = await fetch("/api/cells/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cellId: newCellId,
          memberId: newCellLeader,
          role: "leader",
        }),
      });

      if (!leaderRes.ok) {
        throw new Error("셀장 배정에 실패했습니다.");
      }

      setMessage("셀이 생성되었습니다.");
      setNewCellName("");
      setNewCellLeader("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "셀 생성 오류");
    } finally {
      setCreating(false);
    }
  }, [authEnabled, handleAuthFailure, loadData, newCellLeader, newCellName]);

  const handleUpdateCell = useCallback(async (cellId: string) => {
    if (!editName.trim()) {
      setError("셀 이름을 입력해 주세요.");
      return;
    }

    try {
      const res = await fetch("/api/cells", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cellId,
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "셀 수정 실패");
      }

      setMessage("셀이 수정되었습니다.");
      setEditingCell(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "셀 수정 오류");
    }
  }, [editDescription, editName, loadData]);

  const handleDeleteCell = useCallback(async (cellId: string, cellName: string) => {
    if (!confirm(`"${cellName}" 셀을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/cells?id=${cellId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "셀 삭제 실패");
      }

      setMessage("셀이 삭제되었습니다.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "셀 삭제 오류");
    }
  }, [loadData]);

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
          role: selectedRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "멤버 배정 실패");
      }

      setMessage("멤버가 배정되었습니다.");
      setSelectedMember("");
      setSelectedRole("member");
      setAssigningCell(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "멤버 배정 오류");
    }
  }, [loadData, selectedMember, selectedRole]);

  const handleRemoveMember = useCallback(async (cellId: string, memberId: string, memberName: string) => {
    if (!confirm(`"${memberName}"을(를) 셀에서 제외하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/cells/members?cellId=${cellId}&memberId=${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "멤버 제외 실패");
      }

      setMessage("멤버가 제외되었습니다.");
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

  // Get unassigned members
  const assignedMemberIds = new Set(
    cells.flatMap((c) => c.roster.map((r) => r.member?.id).filter(Boolean))
  );
  const unassignedMembers = members.filter((m) => !assignedMemberIds.has(m.id));

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
        <p className="text-sm text-slate-500">데이터를 불러오는 중...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">셀 관리</h1>
          <p className="text-sm text-slate-500">셀을 생성하고 멤버를 배정하세요.</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-500"
          >
            출석부로 이동
          </a>
          {authEnabled && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-500"
            >
              로그아웃
            </button>
          )}
        </div>
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
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <label className="flex-1 text-sm text-slate-600">
            <span className="mb-1 block font-medium">셀 이름</span>
            <input
              type="text"
              value={newCellName}
              onChange={(e) => setNewCellName(e.target.value)}
              placeholder="예: 1셀"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </label>
          <label className="flex-1 text-sm text-slate-600">
            <span className="mb-1 block font-medium">셀장 *</span>
            <select
              value={newCellLeader}
              onChange={(e) => setNewCellLeader(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="">셀장 선택...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <div className="md:flex md:flex-col md:justify-end">
            <button
              type="button"
              onClick={handleCreateCell}
              disabled={creating}
              className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "생성 중..." : "셀 생성"}
            </button>
          </div>
        </div>
      </div>

      {/* Unassigned Members Info */}
      {unassignedMembers.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          배정되지 않은 멤버: {unassignedMembers.map((m) => m.name).join(", ")} ({unassignedMembers.length}명)
        </div>
      )}

      {/* Cell List */}
      {cells.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          아직 생성된 셀이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {cells.map((cell) => (
            <div key={cell.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {editingCell === cell.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="설명"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateCell(cell.id)}
                      className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCell(null)}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-500"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{cell.name}</h3>
                      {cell.description && (
                        <p className="text-sm text-slate-500">{cell.description}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">{cell.roster.length}명</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCell(cell.id);
                          setEditName(cell.name);
                          setEditDescription(cell.description || "");
                        }}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:border-slate-500"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCell(cell.id, cell.name)}
                        className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-600 transition hover:border-rose-500"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-slate-600">셀원 목록</h4>
                      <button
                        type="button"
                        onClick={() => setAssigningCell(assigningCell === cell.id ? null : cell.id)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:border-slate-500"
                      >
                        {assigningCell === cell.id ? "취소" : "멤버 추가"}
                      </button>
                    </div>

                    {assigningCell === cell.id && (
                      <div className="mt-3 flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row">
                        <select
                          value={selectedMember}
                          onChange={(e) => setSelectedMember(e.target.value)}
                          className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
                        >
                          <option value="">멤버 선택...</option>
                          {members
                            .filter((m) => !cell.roster.some((r) => r.member?.id === m.id))
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} {assignedMemberIds.has(m.id) ? "(다른 셀)" : ""}
                              </option>
                            ))}
                        </select>
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value as CellRole)}
                          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
                        >
                          {CELL_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {CELL_ROLE_LABEL[role]}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAddMember(cell.id)}
                          className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500"
                        >
                          배정
                        </button>
                      </div>
                    )}

                    {cell.roster.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-400">배정된 멤버가 없습니다.</p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {cell.roster.map((entry) => (
                          <li
                            key={entry.member?.id}
                            className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                          >
                            <div>
                              <span className="font-medium text-slate-700">
                                {entry.member?.name || "미등록"}
                              </span>
                              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                {CELL_ROLE_LABEL[entry.role]}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                entry.member &&
                                handleRemoveMember(cell.id, entry.member.id, entry.member.name)
                              }
                              className="text-xs text-rose-500 hover:text-rose-600"
                            >
                              제외
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
