"use client";

import { useCallback, useEffect, useState } from "react";
import type { PrayerSchedule } from "@/types/prayer";
import { AUTH_DISABLED } from "@/lib/auth";

function formatDateString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNextMonday(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  today.setDate(today.getDate() + diff);
  return formatDateString(today);
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateString(date);
}

const DEFAULT_TIMES = [
  { label: "오전 8시", time: "08:00" },
  { label: "오후 8시", time: "20:00" },
];

export default function AdminPrayerPage() {
  const authEnabled = !AUTH_DISABLED;
  const [schedules, setSchedules] = useState<PrayerSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(getNextMonday());
  const [endDate, setEndDate] = useState(addDays(getNextMonday(), 6));

  const handleAuthFailure = useCallback(() => {
    if (!authEnabled) return;
    window.location.href = "/login";
  }, [authEnabled]);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  useEffect(() => {
    let cancelled = false;
    async function loadSchedules() {
      setLoading(true);
      try {
        const response = await fetch("/api/prayer-schedules");
        if (authEnabled && response.status === 401) {
          handleAuthFailure();
          return;
        }
        if (!response.ok) throw new Error("기도회 목록을 불러오지 못했습니다.");
        const data = await response.json();
        if (!cancelled) {
          setSchedules(data.schedules as PrayerSchedule[]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "기도회 목록 조회 실패");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadSchedules();
    return () => { cancelled = true; };
  }, [authEnabled, handleAuthFailure]);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      setError("기도회 이름을 입력해 주세요.");
      return;
    }
    if (!startDate || !endDate) {
      setError("시작일과 종료일을 선택해 주세요.");
      return;
    }
    if (startDate > endDate) {
      setError("종료일이 시작일보다 빠를 수 없습니다.");
      return;
    }

    setCreating(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/prayer-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          startDate,
          endDate,
          times: DEFAULT_TIMES,
        }),
      });
      if (authEnabled && response.status === 401) {
        handleAuthFailure();
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "기도회 생성에 실패했습니다.");
      }
      const schedule = data.schedule as PrayerSchedule;
      setSchedules((prev) => [schedule, ...prev]);
      setMessage("기도회가 생성되었습니다.");
      setName("");
      setStartDate(getNextMonday());
      setEndDate(addDays(getNextMonday(), 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : "기도회 생성 중 오류가 발생했습니다.");
    } finally {
      setCreating(false);
    }
  }, [authEnabled, endDate, handleAuthFailure, name, startDate]);

  const handleLogout = useCallback(async () => {
    if (!authEnabled) return;
    await fetch("/api/session", { method: "DELETE" });
    handleAuthFailure();
  }, [authEnabled, handleAuthFailure]);

  function formatDateRange(start: string, end: string): string {
    return `${start} ~ ${end}`;
  }

  function getDayCount(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">기도회 관리</h1>
          <p className="text-sm text-slate-500">
            기도회를 생성하면 각 셀장이 셀원별 기도 체크리스트를 작성할 수 있습니다.
          </p>
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

      {/* Create Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">새 기도회 생성</h2>
        <p className="mt-1 text-xs text-slate-500">
          기도 시간은 오전 8시 / 오후 8시로 자동 설정됩니다.
        </p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <label className="flex-1 text-sm text-slate-600">
            <span className="mb-1 block font-medium">기도회 이름</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 신년 새벽기도회"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">시작일</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">종료일</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </label>
          <div className="md:flex md:flex-col md:justify-end">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "생성 중..." : "기도회 생성"}
            </button>
          </div>
        </div>
      </div>

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

      {/* Schedule List */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">기도회 목록</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">기도회 목록을 불러오는 중...</p>
        ) : schedules.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">아직 생성된 기도회가 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {schedules.map((schedule) => (
              <li
                key={schedule.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-800">{schedule.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateRange(schedule.startDate, schedule.endDate)} ({getDayCount(schedule.startDate, schedule.endDate)}일)
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    기도 시간: {schedule.times.map((t) => t.label).join(", ")}
                  </p>
                </div>
                <a
                  href={`/admin/prayer/${schedule.id}`}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-500"
                >
                  제출 현황 보기
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
