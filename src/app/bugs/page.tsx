"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { BugReport, BugStatus, BugPriority } from "@/types/bug";

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
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function BugsPage() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<BugPriority>("medium");
  const [reporter, setReporter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<BugStatus | "all">("all");

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  const loadBugs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bugs");
      if (!res.ok) throw new Error("버그 목록을 불러오지 못했습니다.");
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
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!description.trim()) {
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
          title: title.trim(),
          description: description.trim(),
          priority,
          reporter: reporter.trim() || "익명",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "버그 등록에 실패했습니다.");
      }

      setMessage("버그가 등록되었습니다.");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setReporter("");
      setShowForm(false);
      await loadBugs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "버그 등록 오류");
    } finally {
      setSubmitting(false);
    }
  }, [title, description, priority, reporter, loadBugs]);

  const handleStatusChange = useCallback(async (bugId: string, newStatus: BugStatus) => {
    try {
      const res = await fetch("/api/bugs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bugId, status: newStatus }),
      });

      if (!res.ok) throw new Error("상태 변경에 실패했습니다.");

      setMessage("상태가 변경되었습니다.");
      await loadBugs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "상태 변경 오류");
    }
  }, [loadBugs]);

  const filteredBugs = filterStatus === "all"
    ? bugs
    : bugs.filter((bug) => bug.status === filterStatus);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 pb-12 pt-10">
        <section className="mx-auto max-w-4xl px-4">
          <p className="text-sm text-slate-600">데이터를 불러오는 중...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-12 pt-10">
      <section className="mx-auto max-w-4xl space-y-6 px-4">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">버그 리포트</h1>
            <p className="text-sm text-slate-600">발견한 버그나 개선사항을 등록해주세요.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-slate-400"
            >
              홈으로
            </Link>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              {showForm ? "취소" : "버그 등록"}
            </button>
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

        {/* Bug Form */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">새 버그 등록</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="title">
                  제목 *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  placeholder="버그 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="description">
                  내용 *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  placeholder="버그 상황을 자세히 설명해주세요. (어떤 상황에서 발생했는지, 예상 동작과 실제 동작 등)"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="priority">
                    우선순위
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as BugPriority)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                    <option value="critical">긴급</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="reporter">
                    작성자
                  </label>
                  <input
                    id="reporter"
                    type="text"
                    value={reporter}
                    onChange={(e) => setReporter(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                    placeholder="이름 (선택사항)"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-md bg-sky-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "등록 중..." : "등록하기"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">상태:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as BugStatus | "all")}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
          >
            <option value="all">전체 ({bugs.length})</option>
            <option value="open">접수 ({bugs.filter((b) => b.status === "open").length})</option>
            <option value="in_progress">처리중 ({bugs.filter((b) => b.status === "in_progress").length})</option>
            <option value="resolved">해결됨 ({bugs.filter((b) => b.status === "resolved").length})</option>
            <option value="closed">종료 ({bugs.filter((b) => b.status === "closed").length})</option>
          </select>
        </div>

        {/* Bug List */}
        <div className="space-y-4">
          {filteredBugs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-slate-600">
                {filterStatus === "all" ? "등록된 버그가 없습니다." : "해당 상태의 버그가 없습니다."}
              </p>
            </div>
          ) : (
            filteredBugs.map((bug) => (
              <div
                key={bug.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[bug.status]}`}>
                        {STATUS_LABELS[bug.status]}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[bug.priority]}`}>
                        {PRIORITY_LABELS[bug.priority]}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{bug.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{bug.description}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>작성자: {bug.reporter}</span>
                      <span>등록일: {formatDate(bug.createdAt)}</span>
                      {bug.resolvedAt && <span>해결일: {formatDate(bug.resolvedAt)}</span>}
                    </div>
                  </div>
                  <div>
                    <select
                      value={bug.status}
                      onChange={(e) => handleStatusChange(bug.id, e.target.value as BugStatus)}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs focus:border-sky-500 focus:outline-none"
                    >
                      <option value="open">접수</option>
                      <option value="in_progress">처리중</option>
                      <option value="resolved">해결됨</option>
                      <option value="closed">종료</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
