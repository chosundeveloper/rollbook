"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Member } from "@/types/attendance";
import { AUTH_DISABLED } from "@/lib/auth";

export default function AdminMembersPage() {
  const authEnabled = !AUTH_DISABLED;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [newName, setNewName] = useState("");
  const [newBirthYear, setNewBirthYear] = useState("");
  const [newRole, setNewRole] = useState<"leader" | "member">("member");
  const [newJoinedAt, setNewJoinedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [creating, setCreating] = useState(false);

  const handleAuthFailure = useCallback(() => {
    if (!authEnabled) return;
    window.location.href = "/login";
  }, [authEnabled]);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/members");
      if (authEnabled && res.status === 401) {
        handleAuthFailure();
        return;
      }
      if (!res.ok) throw new Error("멤버 정보를 불러오지 못했습니다.");
      const data = await res.json();
      setMembers(data.members as Member[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [authEnabled, handleAuthFailure]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }

    if (newBirthYear.trim()) {
      const year = parseInt(newBirthYear.trim(), 10);
      const currentYear = new Date().getFullYear();
      if (year > currentYear) {
        setError("생년은 현재 연도보다 클 수 없습니다.");
        return;
      }
      if (year < 1900) {
        setError("생년은 1900년 이후여야 합니다.");
        return;
      }
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          birthYear: newBirthYear.trim() ? parseInt(newBirthYear.trim(), 10) : undefined,
          role: newRole,
          joinedAt: newJoinedAt,
        }),
      });

      if (authEnabled && res.status === 401) {
        handleAuthFailure();
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "멤버 등록 실패");
      }

      setMessage("교인이 등록되었습니다.");
      setNewName("");
      setNewBirthYear("");
      setNewRole("member");
      setNewJoinedAt(new Date().toISOString().slice(0, 10));
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "멤버 등록 오류");
    } finally {
      setCreating(false);
    }
  }, [authEnabled, handleAuthFailure, loadMembers, newBirthYear, newName, newRole, newJoinedAt]);

  const handleLogout = useCallback(async () => {
    if (!authEnabled) return;
    await fetch("/api/session", { method: "DELETE" });
    handleAuthFailure();
  }, [authEnabled, handleAuthFailure]);

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
          <h1 className="text-2xl font-semibold">교인 관리</h1>
          <p className="text-sm text-slate-600">교인을 등록하고 관리하세요.</p>
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

      {/* Create Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">새 교인 등록</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="flex-1 text-sm text-slate-600">
            <span className="mb-1 block font-medium">이름 *</span>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </label>
          <label className="w-24 text-sm text-slate-600">
            <span className="mb-1 block font-medium">생년</span>
            <input
              type="number"
              value={newBirthYear}
              onChange={(e) => setNewBirthYear(e.target.value)}
              placeholder="1995"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </label>
          <label className="w-24 text-sm text-slate-600">
            <span className="mb-1 block font-medium">역할 *</span>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "leader" | "member")}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="leader">셀장</option>
              <option value="member">셀원</option>
            </select>
          </label>
          <label className="w-36 text-sm text-slate-600">
            <span className="mb-1 block font-medium">등록일 *</span>
            <input
              type="date"
              value={newJoinedAt}
              onChange={(e) => setNewJoinedAt(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "등록 중..." : "등록"}
            </button>
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">교인 목록</h2>
          <span className="text-sm text-slate-600">{members.length}명</span>
        </div>
        {members.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">등록된 교인이 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">{member.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      member.role === "leader"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {member.role === "leader" ? "셀장" : "셀원"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  {member.birthYear && <span>{member.birthYear}년생</span>}
                  {member.joinedAt && <span>등록: {member.joinedAt}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
