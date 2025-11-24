"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { BugReport, BugStatus } from "@/types/bug";

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function BugsPage() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Simple form
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  const loadBugs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bugs");
      if (!res.ok) throw new Error("불러오기 실패");
      const data = await res.json();
      setBugs(data.bugs as BugReport[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBugs();
  }, [loadBugs]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: content.trim().slice(0, 50),
          description: content.trim(),
          priority: "medium",
          reporter: "익명",
        }),
      });

      if (!res.ok) {
        throw new Error("등록 실패");
      }

      setMessage("등록되었습니다!");
      setContent("");
      await loadBugs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록 오류");
    } finally {
      setSubmitting(false);
    }
  }, [content, loadBugs]);

  const handleStatusChange = useCallback(async (bugId: string, newStatus: BugStatus) => {
    try {
      const res = await fetch("/api/bugs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bugId, status: newStatus }),
      });

      if (!res.ok) throw new Error("상태 변경 실패");
      await loadBugs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "상태 변경 오류");
    }
  }, [loadBugs]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 pb-12 pt-10">
        <section className="mx-auto max-w-2xl px-4">
          <p className="text-sm text-slate-600">불러오는 중...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-12 pt-10">
      <section className="mx-auto max-w-2xl space-y-4 px-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">버그/건의사항</h1>
          <Link
            href="/"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-slate-400"
          >
            홈으로
          </Link>
        </header>

        {/* Simple Input */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            placeholder="버그나 개선사항을 자유롭게 적어주세요... (Enter로 등록)"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-slate-400">Shift+Enter로 줄바꿈</p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "등록 중..." : "등록"}
            </button>
          </div>
        </div>

        {/* Messages */}
        {(error || message) && (
          <div
            className={`rounded-lg px-4 py-2 text-sm ${
              error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || message}
          </div>
        )}

        {/* Bug List */}
        <div className="space-y-2">
          {bugs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-slate-500">아직 등록된 내용이 없습니다.</p>
            </div>
          ) : (
            bugs.map((bug) => (
              <div
                key={bug.id}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{bug.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      <span>{formatDate(bug.createdAt)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[bug.status]}`}>
                        {STATUS_LABELS[bug.status]}
                      </span>
                    </div>
                  </div>
                  <select
                    value={bug.status}
                    onChange={(e) => handleStatusChange(bug.id, e.target.value as BugStatus)}
                    className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="open">접수</option>
                    <option value="in_progress">처리중</option>
                    <option value="resolved">해결됨</option>
                    <option value="closed">종료</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
