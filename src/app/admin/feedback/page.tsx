"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { BugReport, BugStatus, BugPriority, FeedbackType } from "@/types/bug";
import { AUTH_DISABLED } from "@/lib/auth";

const STATUS_LABELS: Record<BugStatus, string> = {
  open: "접수",
  in_progress: "처리중",
  resolved: "해결됨",
  closed: "종료",
};

const STATUS_COLORS: Record<BugStatus, string> = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-600",
};

const TYPE_LABELS: Record<FeedbackType, string> = {
  bug: "버그",
  feature: "기능 요청",
  improvement: "개선",
};

const TYPE_COLORS: Record<FeedbackType, string> = {
  bug: "bg-rose-100 text-rose-700",
  feature: "bg-violet-100 text-violet-700",
  improvement: "bg-sky-100 text-sky-700",
};

const PRIORITY_LABELS: Record<BugPriority, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  critical: "긴급",
};

const PRIORITY_COLORS: Record<BugPriority, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function AdminFeedbackPage() {
  const authEnabled = !AUTH_DISABLED;

  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<BugStatus | "all">("all");
  const [filterType, setFilterType] = useState<FeedbackType | "all">("all");

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");

  const handleAuthFailure = useCallback(() => {
    if (!authEnabled) return;
    window.location.href = "/login";
  }, [authEnabled]);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  const loadBugs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bugs");
      if (authEnabled && res.status === 401) {
        handleAuthFailure();
        return;
      }
      if (!res.ok) throw new Error("불러오기 실패");
      const data = await res.json();
      setBugs(data.bugs as BugReport[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [authEnabled, handleAuthFailure]);

  useEffect(() => {
    loadBugs();
  }, [loadBugs]);

  const handleStatusChange = useCallback(async (bugId: string, newStatus: BugStatus) => {
    try {
      const res = await fetch("/api/bugs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bugId, status: newStatus }),
      });

      if (!res.ok) throw new Error("상태 변경 실패");
      setMessage("상태가 변경되었습니다.");
      await loadBugs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "상태 변경 오류");
    }
  }, [loadBugs]);

  const handlePriorityChange = useCallback(async (bugId: string, newPriority: BugPriority) => {
    try {
      const res = await fetch("/api/bugs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bugId, priority: newPriority }),
      });

      if (!res.ok) throw new Error("우선순위 변경 실패");
      setMessage("우선순위가 변경되었습니다.");
      await loadBugs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "우선순위 변경 오류");
    }
  }, [loadBugs]);

  const handleTypeChange = useCallback(async (bugId: string, newType: FeedbackType) => {
    try {
      const res = await fetch("/api/bugs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bugId, type: newType }),
      });

      if (!res.ok) throw new Error("유형 변경 실패");
      setMessage("유형이 변경되었습니다.");
      await loadBugs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "유형 변경 오류");
    }
  }, [loadBugs]);

  const handleSaveNote = useCallback(async (bugId: string) => {
    try {
      const res = await fetch("/api/bugs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bugId, adminNote: editNote }),
      });

      if (!res.ok) throw new Error("메모 저장 실패");
      setMessage("메모가 저장되었습니다.");
      setEditingId(null);
      setEditNote("");
      await loadBugs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "메모 저장 오류");
    }
  }, [editNote, loadBugs]);

  const handleDelete = useCallback(async (bugId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/bugs?id=${bugId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("삭제 실패");
      setMessage("삭제되었습니다.");
      await loadBugs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 오류");
    }
  }, [loadBugs]);

  // Filter bugs
  const filteredBugs = bugs.filter((bug) => {
    if (filterStatus !== "all" && bug.status !== filterStatus) return false;
    if (filterType !== "all" && bug.type !== filterType) return false;
    return true;
  });

  // Stats
  const stats = {
    total: bugs.length,
    open: bugs.filter((b) => b.status === "open").length,
    inProgress: bugs.filter((b) => b.status === "in_progress").length,
    resolved: bugs.filter((b) => b.status === "resolved" || b.status === "closed").length,
  };

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
          <h1 className="text-xl font-bold text-slate-900">피드백 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">버그 리포트 및 개선 요청을 관리합니다</p>
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl bg-slate-100 p-3 text-center">
          <p className="text-2xl font-bold text-slate-700">{stats.total}</p>
          <p className="text-xs text-slate-500">전체</p>
        </div>
        <div className="rounded-xl bg-red-50 p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.open}</p>
          <p className="text-xs text-red-500">접수</p>
        </div>
        <div className="rounded-xl bg-yellow-50 p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          <p className="text-xs text-yellow-500">처리중</p>
        </div>
        <div className="rounded-xl bg-green-50 p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          <p className="text-xs text-green-500">완료</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">상태</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as BugStatus | "all")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
            >
              <option value="all">전체</option>
              <option value="open">접수</option>
              <option value="in_progress">처리중</option>
              <option value="resolved">해결됨</option>
              <option value="closed">종료</option>
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">유형</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FeedbackType | "all")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
            >
              <option value="all">전체</option>
              <option value="bug">버그</option>
              <option value="feature">기능 요청</option>
              <option value="improvement">개선</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">피드백 목록</h2>
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
            {filteredBugs.length}개
          </span>
        </div>

        {filteredBugs.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-8 text-center">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-slate-600 font-medium">피드백이 없습니다</p>
            <p className="text-sm text-slate-400 mt-1">
              {filterStatus !== "all" || filterType !== "all"
                ? "필터 조건을 변경해 보세요"
                : "아직 등록된 피드백이 없습니다"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBugs.map((bug) => (
              <div
                key={bug.id}
                className="rounded-xl bg-slate-50 p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[bug.type || "bug"]}`}>
                      {TYPE_LABELS[bug.type || "bug"]}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[bug.status]}`}>
                      {STATUS_LABELS[bug.status]}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[bug.priority]}`}>
                      {PRIORITY_LABELS[bug.priority]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(bug.id)}
                    className="text-xs text-rose-500 hover:text-rose-600 font-medium"
                  >
                    삭제
                  </button>
                </div>

                {/* Content */}
                <p className="whitespace-pre-wrap text-sm text-slate-700 mb-3">{bug.description}</p>

                {/* Admin Note */}
                {editingId === bug.id ? (
                  <div className="mb-3 rounded-lg bg-white p-3 border border-slate-200">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">관리자 메모</label>
                    <textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      rows={2}
                      className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                      placeholder="처리 내용이나 메모를 입력하세요..."
                    />
                    <div className="mt-2 flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditNote("");
                        }}
                        className="rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNote(bug.id)}
                        className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : bug.adminNote ? (
                  <div
                    className="mb-3 rounded-lg bg-amber-50 p-3 cursor-pointer hover:bg-amber-100 transition"
                    onClick={() => {
                      setEditingId(bug.id);
                      setEditNote(bug.adminNote || "");
                    }}
                  >
                    <p className="text-xs font-medium text-amber-600 mb-1">관리자 메모</p>
                    <p className="text-sm text-amber-700">{bug.adminNote}</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(bug.id);
                      setEditNote("");
                    }}
                    className="mb-3 text-xs text-slate-400 hover:text-slate-600"
                  >
                    + 메모 추가
                  </button>
                )}

                {/* Meta & Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-400">{formatDate(bug.createdAt)}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400">{bug.reporter}</span>

                  <div className="ml-auto flex gap-1.5">
                    <select
                      value={bug.type || "bug"}
                      onChange={(e) => handleTypeChange(bug.id, e.target.value as FeedbackType)}
                      className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-rose-500 focus:outline-none"
                    >
                      <option value="bug">버그</option>
                      <option value="feature">기능</option>
                      <option value="improvement">개선</option>
                    </select>
                    <select
                      value={bug.priority}
                      onChange={(e) => handlePriorityChange(bug.id, e.target.value as BugPriority)}
                      className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-rose-500 focus:outline-none"
                    >
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                      <option value="critical">긴급</option>
                    </select>
                    <select
                      value={bug.status}
                      onChange={(e) => handleStatusChange(bug.id, e.target.value as BugStatus)}
                      className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-rose-500 focus:outline-none"
                    >
                      <option value="open">접수</option>
                      <option value="in_progress">처리중</option>
                      <option value="resolved">해결됨</option>
                      <option value="closed">종료</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
