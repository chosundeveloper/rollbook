"use client";

import { useCallback, useEffect, useState } from "react";
import { AUTH_DISABLED } from "@/lib/auth";

interface Account {
  id: string;
  username: string;
  displayName?: string;
  roles?: string[];
  cellId?: string;
}

export default function AdminAccountsPage() {
  const authEnabled = !AUTH_DISABLED;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "leader">("leader");
  const [creating, setCreating] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "leader">("leader");

  const handleAuthFailure = useCallback(() => {
    if (!authEnabled) return;
    window.location.href = "/login";
  }, [authEnabled]);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      if (authEnabled && res.status === 401) {
        handleAuthFailure();
        return;
      }
      if (res.status === 403) {
        setError("관리자 권한이 필요합니다.");
        return;
      }
      if (!res.ok) throw new Error("계정 정보를 불러오지 못했습니다.");
      const data = await res.json();
      setAccounts(data.accounts as Account[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [authEnabled, handleAuthFailure]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleCreate = useCallback(async () => {
    if (!newUsername.trim()) {
      setError("아이디를 입력해 주세요.");
      return;
    }
    if (!newPassword.trim()) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword.trim(),
          displayName: newDisplayName.trim() || undefined,
          roles: [newRole],
        }),
      });

      if (authEnabled && res.status === 401) {
        handleAuthFailure();
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "계정 생성 실패");
      }

      setMessage("계정이 생성되었습니다.");
      setNewUsername("");
      setNewPassword("");
      setNewDisplayName("");
      setNewRole("leader");
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "계정 생성 오류");
    } finally {
      setCreating(false);
    }
  }, [authEnabled, handleAuthFailure, loadAccounts, newDisplayName, newPassword, newRole, newUsername]);

  const handleUpdate = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          displayName: editDisplayName.trim() || undefined,
          password: editPassword.trim() || undefined,
          roles: [editRole],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "계정 수정 실패");
      }

      setMessage("계정이 수정되었습니다.");
      setEditingId(null);
      setEditPassword("");
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "계정 수정 오류");
    }
  }, [editDisplayName, editPassword, editRole, loadAccounts]);

  const handleDelete = useCallback(async (id: string, username: string) => {
    if (!confirm(`"${username}" 계정을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/accounts?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "계정 삭제 실패");
      }

      setMessage("계정이 삭제되었습니다.");
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "계정 삭제 오류");
    }
  }, [loadAccounts]);

  const handleLogout = useCallback(async () => {
    if (!authEnabled) return;
    await fetch("/api/session", { method: "DELETE" });
    handleAuthFailure();
  }, [authEnabled, handleAuthFailure]);

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
          <h1 className="text-2xl font-semibold">계정 관리</h1>
          <p className="text-sm text-slate-500">로그인 계정을 관리하세요.</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-500"
          >
            출석부
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

      {/* Create Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">새 계정 생성</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">아이디 *</span>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="username"
              autoComplete="off"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">비밀번호 *</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="password"
              autoComplete="new-password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">이름</span>
            <input
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">권한</span>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "admin" | "leader")}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="admin">관리자</option>
              <option value="leader">셀장</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "생성 중..." : "생성"}
            </button>
          </div>
        </div>
      </div>

      {/* Account List */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">계정 목록</h2>
          <span className="text-sm text-slate-500">{accounts.length}개</span>
        </div>
        {accounts.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">등록된 계정이 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="rounded-lg border border-slate-100 px-4 py-3"
              >
                {editingId === account.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <input
                        type="text"
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        placeholder="이름"
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                      />
                      <input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="새 비밀번호 (변경시에만)"
                        autoComplete="new-password"
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                      />
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as "admin" | "leader")}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                      >
                        <option value="admin">관리자</option>
                        <option value="leader">셀장</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(account.id)}
                        className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditPassword("");
                        }}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-500"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-700">{account.username}</span>
                      {account.displayName && (
                        <span className="text-sm text-slate-500">({account.displayName})</span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          account.roles?.includes("admin")
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {account.roles?.includes("admin") ? "관리자" : "셀장"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(account.id);
                          setEditDisplayName(account.displayName || "");
                          setEditRole(account.roles?.includes("admin") ? "admin" : "leader");
                          setEditPassword("");
                        }}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:border-slate-500"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(account.id, account.username)}
                        className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-600 transition hover:border-rose-500"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
