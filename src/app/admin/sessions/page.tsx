"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { AttendanceSession } from "@/types/attendance";
import { AUTH_DISABLED } from "@/lib/auth";

export default function AdminSessionsPage() {
  const authEnabled = !AUTH_DISABLED;

  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [newDate, setNewDate] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? 0 : day;
    today.setDate(today.getDate() - diff);
    return today.toISOString().slice(0, 10);
  });
  const [newTitle, setNewTitle] = useState("");
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

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions");
      if (authEnabled && res.status === 401) {
        handleAuthFailure();
        return;
      }
      if (!res.ok) throw new Error("출석부 목록을 불러오지 못했습니다.");
      const data = await res.json();
      setSessions(data.sessions as AttendanceSession[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [authEnabled, handleAuthFailure]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleCreate = useCallback(async () => {
    if (!newDate) {
      setError("날짜를 선택해 주세요.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newDate,
          title: newTitle.trim() || undefined,
        }),
      });

      if (authEnabled && res.status === 401) {
        handleAuthFailure();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "출석부 생성 실패");
      }

      setMessage("출석부가 생성되었습니다.");
      setNewTitle("");
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "출석부 생성 오류");
    } finally {
      setCreating(false);
    }
  }, [authEnabled, handleAuthFailure, loadSessions, newDate, newTitle]);

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
          <h1 className="text-2xl font-semibold">출석부 관리</h1>
          <p className="text-sm text-slate-600">출석부를 생성하고 관리하세요.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-500"
          >
            대시보드
          </Link>
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
        <h2 className="text-base font-semibold text-slate-800">새 출석부 생성</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="flex-1 text-sm text-slate-600">
            <span className="mb-1 block font-medium">예배 날짜 *</span>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </label>
          <label className="flex-1 text-sm text-slate-600">
            <span className="mb-1 block font-medium">설명 (선택)</span>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="예: 1주차 주일예배"
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
              {creating ? "생성 중..." : "생성"}
            </button>
          </div>
        </div>
      </div>

      {/* Session List */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">출석부 목록</h2>
          <span className="text-sm text-slate-600">{sessions.length}개</span>
        </div>
        {sessions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">생성된 출석부가 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-700">{session.date}</p>
                  {session.title && <p className="text-sm text-slate-600">{session.title}</p>}
                </div>
                <span className="text-xs text-slate-600">
                  {new Date(session.createdAt).toLocaleDateString("ko-KR")} 생성
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
