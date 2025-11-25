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
    <section className="mx-auto max-w-4xl space-y-5 px-4 pb-6 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">출석부 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">출석부를 생성하고 관리하세요</p>
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

      {/* Create Form */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <h2 className="text-base font-bold text-slate-800 mb-4">새 출석부 생성</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">예배 날짜</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-sky-500 focus:bg-white focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">설명 (선택)</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="예: 1주차 주일예배"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-sky-500 focus:bg-white focus:outline-none transition"
            />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 active:scale-[0.98] disabled:opacity-60"
          >
            {creating ? "생성 중..." : "출석부 생성"}
          </button>
        </div>
      </div>

      {/* Session List */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">출석부 목록</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{sessions.length}개</span>
        </div>
        {sessions.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-600 font-medium">출석부가 없습니다</p>
            <p className="text-sm text-slate-400 mt-1">위에서 새 출석부를 만들어 보세요</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/admin/sessions/${session.date}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-sky-50 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                      📅
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">{session.date}</p>
                      <p className="text-xs text-slate-400">
                        {session.title || new Date(session.createdAt).toLocaleDateString("ko-KR") + " 생성"}
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-300 text-lg">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
