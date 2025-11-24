"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { PrayerSchedule, PrayerCheckEntry } from "@/types/prayer";
import { AUTH_DISABLED } from "@/lib/auth";

interface CellRosterEntry {
  role: string;
  member?: {
    id: string;
    name: string;
  };
}

interface CellResponse {
  id: string;
  name: string;
  roster: CellRosterEntry[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    const year = current.getFullYear();
    const month = `${current.getMonth() + 1}`.padStart(2, "0");
    const day = `${current.getDate()}`.padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function AdminPrayerDetailPage() {
  const params = useParams();
  const scheduleId = params.id as string;
  const authEnabled = !AUTH_DISABLED;

  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null);
  const [cells, setCells] = useState<CellResponse[]>([]);
  const [checks, setChecks] = useState<PrayerCheckEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuthFailure = useCallback(() => {
    if (!authEnabled) return;
    window.location.href = "/login";
  }, [authEnabled]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        // Load schedule info
        const scheduleRes = await fetch("/api/prayer-schedules");
        if (authEnabled && scheduleRes.status === 401) {
          handleAuthFailure();
          return;
        }
        if (!scheduleRes.ok) throw new Error("기도회 정보를 불러오지 못했습니다.");
        const scheduleData = await scheduleRes.json();
        const foundSchedule = (scheduleData.schedules as PrayerSchedule[]).find(
          (s) => s.id === scheduleId
        );
        if (!foundSchedule) throw new Error("기도회를 찾을 수 없습니다.");

        // Load cells
        const cellsRes = await fetch("/api/cells");
        if (!cellsRes.ok) throw new Error("셀 정보를 불러오지 못했습니다.");
        const cellsData = await cellsRes.json();

        // Load prayer checks
        const checksRes = await fetch(`/api/prayer-checks?scheduleId=${scheduleId}`);
        if (!checksRes.ok) throw new Error("기도 체크 정보를 불러오지 못했습니다.");
        const checksData = await checksRes.json();

        if (!cancelled) {
          setSchedule(foundSchedule);
          setCells(cellsData.cells as CellResponse[]);
          setChecks(checksData.checks as PrayerCheckEntry[]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "데이터 로드 실패");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [authEnabled, handleAuthFailure, scheduleId]);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
        <p className="text-sm text-slate-500">데이터를 불러오는 중...</p>
      </section>
    );
  }

  if (error || !schedule) {
    return (
      <section className="mx-auto max-w-6xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error || "기도회를 찾을 수 없습니다."}
        </div>
        <Link href="/admin/prayer" className="text-sm text-sky-600 hover:underline">
          ← 기도회 목록으로 돌아가기
        </Link>
      </section>
    );
  }

  const dates = getDatesInRange(schedule.startDate, schedule.endDate);

  // Build check lookup: cellId-memberId-date-timeId -> checked
  const checkMap = new Map<string, boolean>();
  checks.forEach((c) => {
    if (c.checked) {
      checkMap.set(`${c.cellId}-${c.memberId}-${c.date}-${c.timeId}`, true);
    }
  });

  // Calculate cell summaries
  const getCellSummary = (cell: CellResponse) => {
    const memberIds = cell.roster.map((r) => r.member?.id).filter(Boolean) as string[];
    const totalSlots = memberIds.length * dates.length * schedule.times.length;
    let checkedCount = 0;
    memberIds.forEach((memberId) => {
      dates.forEach((date) => {
        schedule.times.forEach((time) => {
          if (checkMap.get(`${cell.id}-${memberId}-${date}-${time.id}`)) {
            checkedCount++;
          }
        });
      });
    });
    const rate = totalSlots > 0 ? Math.round((checkedCount / totalSlots) * 100) : 0;
    return { totalSlots, checkedCount, rate, memberCount: memberIds.length };
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{schedule.name}</h1>
          <p className="text-sm text-slate-500">
            {schedule.startDate} ~ {schedule.endDate} ({dates.length}일)
          </p>
          <p className="mt-1 text-xs text-slate-400">
            기도 시간: {schedule.times.map((t) => t.label).join(", ")}
          </p>
        </div>
        <Link
          href="/admin/prayer"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-500"
        >
          ← 기도회 목록
        </Link>
      </header>

      {/* Cell Summaries */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cells.map((cell) => {
          const summary = getCellSummary(cell);
          return (
            <div
              key={cell.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800">{cell.name}</p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    summary.rate >= 80
                      ? "bg-emerald-100 text-emerald-700"
                      : summary.rate >= 50
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {summary.rate}%
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {summary.memberCount}명 · {summary.checkedCount}/{summary.totalSlots} 체크
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all ${
                    summary.rate >= 80
                      ? "bg-emerald-500"
                      : summary.rate >= 50
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                  style={{ width: `${summary.rate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed View */}
      {cells.map((cell) => {
        const members = cell.roster
          .map((r) => r.member)
          .filter((m): m is { id: string; name: string } => Boolean(m));
        if (members.length === 0) return null;

        return (
          <div
            key={cell.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-800">{cell.name}</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="sticky left-0 bg-white px-2 py-2 text-left font-semibold text-slate-600">
                      셀원
                    </th>
                    {dates.map((date) => (
                      <th
                        key={date}
                        colSpan={schedule.times.length}
                        className="px-2 py-2 text-center font-semibold text-slate-600"
                      >
                        {formatDate(date)}
                      </th>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-100">
                    <th className="sticky left-0 bg-white px-2 py-1" />
                    {dates.map((date) =>
                      schedule.times.map((time) => (
                        <th
                          key={`${date}-${time.id}`}
                          className="px-1 py-1 text-center text-[10px] font-normal text-slate-400"
                        >
                          {time.label.replace("시", "")}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-slate-50">
                      <td className="sticky left-0 bg-white px-2 py-2 font-medium text-slate-700">
                        {member.name}
                      </td>
                      {dates.map((date) =>
                        schedule.times.map((time) => {
                          const checked = checkMap.get(
                            `${cell.id}-${member.id}-${date}-${time.id}`
                          );
                          return (
                            <td
                              key={`${date}-${time.id}`}
                              className="px-1 py-2 text-center"
                            >
                              {checked ? (
                                <span className="inline-block h-4 w-4 rounded-full bg-emerald-500 text-white text-[10px] leading-4">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-block h-4 w-4 rounded-full bg-slate-100 text-slate-300 text-[10px] leading-4">
                                  -
                                </span>
                              )}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}
