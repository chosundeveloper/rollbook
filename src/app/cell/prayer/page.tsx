"use client";

import { useCallback, useEffect, useState } from "react";
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

interface AccountInfo {
  cellId: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
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

export default function CellPrayerPage() {
  const authEnabled = !AUTH_DISABLED;

  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [schedules, setSchedules] = useState<PrayerSchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [cell, setCell] = useState<CellResponse | null>(null);
  const [checkState, setCheckState] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuthFailure = useCallback(() => {
    if (!authEnabled) return;
    window.location.href = "/login";
  }, [authEnabled]);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  // Load account info and schedules
  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setLoading(true);
      try {
        // Get account info
        const sessionRes = await fetch("/api/session/me");
        if (authEnabled && sessionRes.status === 401) {
          handleAuthFailure();
          return;
        }
        if (!sessionRes.ok) throw new Error("계정 정보를 불러오지 못했습니다.");
        const sessionData = await sessionRes.json();
        if (!sessionData.cellId) throw new Error("셀 배정 정보가 없습니다.");

        // Get schedules
        const schedulesRes = await fetch("/api/prayer-schedules");
        if (!schedulesRes.ok) throw new Error("기도회 목록을 불러오지 못했습니다.");
        const schedulesData = await schedulesRes.json();

        // Get cell info
        const cellsRes = await fetch("/api/cells");
        if (!cellsRes.ok) throw new Error("셀 정보를 불러오지 못했습니다.");
        const cellsData = await cellsRes.json();
        const myCell = (cellsData.cells as CellResponse[]).find(
          (c) => c.id === sessionData.cellId
        );

        if (!cancelled) {
          setAccount({ cellId: sessionData.cellId });
          setSchedules(schedulesData.schedules as PrayerSchedule[]);
          setCell(myCell || null);
          if (schedulesData.schedules.length > 0) {
            setSelectedScheduleId(schedulesData.schedules[0].id);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "초기 데이터 로드 실패");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitialData();
    return () => { cancelled = true; };
  }, [authEnabled, handleAuthFailure]);

  // Load checks when schedule changes
  useEffect(() => {
    if (!selectedScheduleId || !account?.cellId) return;
    const cellId = account.cellId;
    let cancelled = false;

    async function loadChecks() {
      try {
        const res = await fetch(
          `/api/prayer-checks?scheduleId=${selectedScheduleId}&cellId=${cellId}`
        );
        if (!res.ok) throw new Error("체크 정보를 불러오지 못했습니다.");
        const data = await res.json();
        if (!cancelled) {
          // Build check state map
          const state: Record<string, boolean> = {};
          (data.checks as PrayerCheckEntry[]).forEach((c) => {
            state[`${c.memberId}-${c.date}-${c.timeId}`] = c.checked;
          });
          setCheckState(state);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "체크 정보 로드 실패");
        }
      }
    }

    loadChecks();
    return () => { cancelled = true; };
  }, [selectedScheduleId, account]);

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId) || null;

  const handleCheck = useCallback((memberId: string, date: string, timeId: string) => {
    const key = `${memberId}-${date}-${timeId}`;
    setCheckState((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedScheduleId || !account || !cell) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const schedule = schedules.find((s) => s.id === selectedScheduleId);
      if (!schedule) throw new Error("기도회를 찾을 수 없습니다.");

      const dates = getDatesInRange(schedule.startDate, schedule.endDate);
      const members = cell.roster
        .map((r) => r.member)
        .filter((m): m is { id: string; name: string } => Boolean(m));

      const entries: Array<{
        memberId: string;
        memberName: string;
        date: string;
        timeId: string;
        checked: boolean;
      }> = [];

      members.forEach((member) => {
        dates.forEach((date) => {
          schedule.times.forEach((time) => {
            const key = `${member.id}-${date}-${time.id}`;
            entries.push({
              memberId: member.id,
              memberName: member.name,
              date,
              timeId: time.id,
              checked: checkState[key] || false,
            });
          });
        });
      });

      const res = await fetch("/api/prayer-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: selectedScheduleId,
          cellId: account.cellId,
          entries,
        }),
      });

      if (authEnabled && res.status === 401) {
        handleAuthFailure();
        return;
      }
      if (!res.ok) throw new Error("저장에 실패했습니다.");

      setMessage("기도 체크가 저장되었습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 오류");
    } finally {
      setSaving(false);
    }
  }, [account, authEnabled, cell, checkState, handleAuthFailure, schedules, selectedScheduleId]);

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

  if (!cell) {
    return (
      <section className="mx-auto max-w-4xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          셀 배정 정보가 없습니다. 관리자에게 문의하세요.
        </div>
      </section>
    );
  }

  const members = cell.roster
    .map((r) => r.member)
    .filter((m): m is { id: string; name: string } => Boolean(m));
  const dates = selectedSchedule
    ? getDatesInRange(selectedSchedule.startDate, selectedSchedule.endDate)
    : [];

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">기도회 체크리스트</h1>
          <p className="text-sm text-slate-500">{cell.name} - 셀원별 기도 참석 체크</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/cell"
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

      {/* Schedule selector */}
      {schedules.length === 0 ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          아직 생성된 기도회가 없습니다.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-medium text-slate-600">
            기도회 선택
            <select
              value={selectedScheduleId || ""}
              onChange={(e) => setSelectedScheduleId(e.target.value || null)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            >
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startDate} ~ {s.endDate})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

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

      {/* Check table */}
      {selectedSchedule && members.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="sticky left-0 bg-white px-3 py-3 text-left font-semibold text-slate-600">
                    셀원
                  </th>
                  {dates.map((date) => (
                    <th
                      key={date}
                      colSpan={selectedSchedule.times.length}
                      className="px-2 py-3 text-center font-semibold text-slate-600"
                    >
                      {formatDate(date)}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="sticky left-0 bg-white px-3 py-1" />
                  {dates.map((date) =>
                    selectedSchedule.times.map((time) => (
                      <th
                        key={`${date}-${time.id}`}
                        className="px-1 py-1 text-center text-xs font-normal text-slate-400"
                      >
                        {time.label}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-slate-50">
                    <td className="sticky left-0 bg-white px-3 py-3 font-medium text-slate-700">
                      {member.name}
                    </td>
                    {dates.map((date) =>
                      selectedSchedule.times.map((time) => {
                        const key = `${member.id}-${date}-${time.id}`;
                        const checked = checkState[key] || false;
                        return (
                          <td key={`${date}-${time.id}`} className="px-1 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleCheck(member.id, date, time.id)}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 transition ${
                                checked
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-slate-200 bg-white text-slate-300 hover:border-slate-300"
                              }`}
                            >
                              {checked ? "✓" : ""}
                            </button>
                          </td>
                        );
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "저장 중..." : "체크 저장"}
            </button>
          </div>
        </div>
      )}

      {selectedSchedule && members.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
          셀원이 없습니다.
        </div>
      )}
    </section>
  );
}
