"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import jsPDF from "jspdf";
import type { AttendanceSession, AttendanceStatus, CellRole, Member } from "@/types/attendance";
import type { PrayerSchedule } from "@/types/prayer";
import { AUTH_DISABLED } from "@/lib/auth";

interface AttendanceApiResponse {
  date: string;
  entries: Array<{
    memberId?: string;
    displayName: string;
    status: AttendanceStatus;
    note?: string;
    isVisitor?: boolean;
  }>;
  summary: {
    online: number;
    offline: number;
    absent: number;
    total: number;
  };
}

interface VisitorInput {
  tempId: string;
  name: string;
  status: AttendanceStatus;
}

interface CellRosterEntry {
  role: CellRole;
  member?: Member;
}

interface CellResponse {
  id: string;
  number: number;
  name: string;
  leaderId: string;
  roster: CellRosterEntry[];
}

const STATUS_OPTIONS: Array<{ value: AttendanceStatus; label: string }> = [
  { value: "offline", label: "오프라인" },
  { value: "online", label: "온라인" },
  { value: "absent", label: "결석" },
];

const STATUS_LABEL_MAP: Record<AttendanceStatus, string> = {
  offline: "오프라인",
  online: "온라인",
  absent: "결석",
};

const DEFAULT_STATUS: AttendanceStatus = "absent";

const CELL_ROLE_LABEL: Record<CellRole, string> = {
  leader: "셀장",
  subleader: "부셀장",
  member: "셀원",
};

function getCurrentSunday(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 0 : day;
  today.setHours(0, 0, 0, 0);
  today.setDate(today.getDate() - diff);
  return formatDateString(today);
}

function formatDateString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createTempId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `temp-${Math.random().toString(36).slice(2, 10)}`;
}

function createVisitor(name: string): VisitorInput {
  return {
    tempId: createTempId(),
    name,
    status: "offline",
  };
}

function sortSessions(list: AttendanceSession[]) {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

function renderSessionLabel(session: AttendanceSession) {
  return session.title ? `${session.date} • ${session.title}` : session.date;
}

interface AttendanceBoardProps {
  mode?: "admin" | "cell";
  cellFilterId?: string;
}

export default function AttendanceBoard({ mode = "admin", cellFilterId }: AttendanceBoardProps) {
  const router = useRouter();
  const authEnabled = !AUTH_DISABLED;
  const [members, setMembers] = useState<Member[]>([]);
  const [cells, setCells] = useState<CellResponse[]>([]);
  const [cellsLoading, setCellsLoading] = useState(true);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [prayerSchedules, setPrayerSchedules] = useState<PrayerSchedule[]>([]);
  const [prayerSchedulesLoading, setPrayerSchedulesLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newSessionDate, setNewSessionDate] = useState<string>(getCurrentSunday());
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [creatingSession, setCreatingSession] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [visitors, setVisitors] = useState<VisitorInput[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newVisitorName, setNewVisitorName] = useState("");
  const [collapsedCells, setCollapsedCells] = useState<Record<string, boolean>>({});

  const handleAuthFailure = useCallback(() => {
    if (!authEnabled) {
      return;
    }
    window.location.href = "/login";
  }, [authEnabled]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  useEffect(() => {
    let cancelled = false;
    async function loadCells() {
      setCellsLoading(true);
      try {
        const response = await fetch("/api/cells", { credentials: "include" });
        if (authEnabled && response.status === 401) {
          handleAuthFailure();
          return;
        }
        if (!response.ok) {
          throw new Error("셀 정보를 불러오지 못했습니다.");
        }
        const data = await response.json();
        if (!cancelled) {
          const records = data.cells as CellResponse[];
          const filteredCells = cellFilterId ? records.filter((cell) => cell.id === cellFilterId) : records;
          setCells(filteredCells);
          const flattened = filteredCells
            .flatMap((cell) => cell.roster.map((entry) => entry.member))
            .filter((member): member is Member => Boolean(member));
          setMembers(flattened);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "셀 목록 조회 실패");
        }
      } finally {
        if (!cancelled) {
          setCellsLoading(false);
        }
      }
    }
    loadCells();
    return () => {
      cancelled = true;
    };
  }, [authEnabled, cellFilterId, handleAuthFailure]);

  useEffect(() => {
    setCollapsedCells((prev) => {
      const next: Record<string, boolean> = {};
      cells.forEach((cell) => {
        next[cell.id] = prev[cell.id] ?? false;
      });
      return next;
    });
  }, [cells]);

  const toggleCell = useCallback((cellId: string) => {
    setCollapsedCells((prev) => ({ ...prev, [cellId]: !(prev[cellId] ?? false) }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadSessions() {
      setSessionsLoading(true);
      try {
        const response = await fetch("/api/sessions", { credentials: "include" });
        if (authEnabled && response.status === 401) {
          handleAuthFailure();
          return;
        }
        if (!response.ok) {
          throw new Error("출석부 목록을 불러오지 못했습니다.");
        }
        const data = await response.json();
        if (!cancelled) {
          setSessions(sortSessions(data.sessions as AttendanceSession[]));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "출석부 목록 조회 실패");
        }
      } finally {
        if (!cancelled) {
          setSessionsLoading(false);
        }
      }
    }
    loadSessions();
    return () => {
      cancelled = true;
    };
  }, [authEnabled, handleAuthFailure]);

  // 기도회 일정 로드
  useEffect(() => {
    let cancelled = false;
    async function loadPrayerSchedules() {
      setPrayerSchedulesLoading(true);
      try {
        const response = await fetch("/api/prayer-schedules", { credentials: "include" });
        if (authEnabled && response.status === 401) {
          handleAuthFailure();
          return;
        }
        if (!response.ok) {
          throw new Error("기도회 일정을 불러오지 못했습니다.");
        }
        const data = await response.json();
        if (!cancelled) {
          setPrayerSchedules(data.schedules as PrayerSchedule[]);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("기도회 일정 조회 실패:", err);
        }
      } finally {
        if (!cancelled) {
          setPrayerSchedulesLoading(false);
        }
      }
    }
    loadPrayerSchedules();
    return () => {
      cancelled = true;
    };
  }, [authEnabled, handleAuthFailure, mode]);

  useEffect(() => {
    if (sessions.length === 0) {
      if (selectedDate !== null) {
        setSelectedDate(null);
      }
      return;
    }
    if (!selectedDate) {
      setSelectedDate(sessions[0].date);
    }
  }, [sessions, selectedDate]);

  const hydrateAttendance = useCallback((payload: AttendanceApiResponse) => {
    const memberStatus: Record<string, AttendanceStatus> = {};
    const memberNotes: Record<string, string> = {};
    const visitorEntries: VisitorInput[] = [];

    payload.entries.forEach((entry) => {
      if (entry.memberId) {
        memberStatus[entry.memberId] = entry.status;
        if (entry.note) {
          memberNotes[entry.memberId] = entry.note;
        }
        return;
      }
      visitorEntries.push({
        tempId: createTempId(),
        name: entry.displayName,
        status: entry.status,
      });
    });

    setStatusMap(memberStatus);
    setNotes(memberNotes);
    setVisitors(visitorEntries);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!selectedDate) {
      setStatusMap({});
      setNotes({});
      setVisitors([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    async function loadAttendance() {
      setLoading(true);
      setError(null);
      setStatusMap({});
      setNotes({});
      setVisitors([]);
      try {
      const response = await fetch(`/api/attendance?date=${selectedDate}`, { credentials: "include" });
        if (authEnabled && response.status === 401) {
          handleAuthFailure();
          return;
        }
        if (!response.ok) {
          throw new Error("출석 정보를 불러오지 못했습니다.");
        }
        const payload = (await response.json()) as AttendanceApiResponse;
        if (!cancelled) {
          hydrateAttendance(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "출석 조회 실패");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAttendance();
    return () => {
      cancelled = true;
    };
  }, [authEnabled, handleAuthFailure, hydrateAttendance, selectedDate]);

  const computedSummary = useMemo(() => {
    const counts = { online: 0, offline: 0, absent: 0 } as Record<AttendanceStatus, number>;
    members.forEach((member) => {
      const status = statusMap[member.id] ?? DEFAULT_STATUS;
      counts[status] += 1;
    });
    visitors.forEach((visitor) => {
      counts[visitor.status] += 1;
    });
    const total = members.length + visitors.length;
    return {
      online: counts.online,
      offline: counts.offline,
      absent: counts.absent,
      total,
    };
  }, [members, statusMap, visitors]);

  const currentSession = useMemo(
    () => sessions.find((session) => session.date === selectedDate) || null,
    [selectedDate, sessions],
  );

  const getCellSummary = useCallback(
    (cell: CellResponse) => {
      const summary = { online: 0, offline: 0, absent: 0 } as Record<AttendanceStatus, number>;
      cell.roster.forEach((entry) => {
        const memberId = entry.member?.id;
        const status = memberId ? (statusMap[memberId] ?? DEFAULT_STATUS) : "absent";
        summary[status] += 1;
      });
      return summary;
    },
    [statusMap],
  );

  const isCellSubmitted = useCallback(
    (cell: CellResponse) => {
      if (!selectedDate) {
        return false;
      }
      return cell.roster.every((entry) => {
        const memberId = entry.member?.id;
        return memberId ? statusMap[memberId] !== undefined : false;
      });
    },
    [selectedDate, statusMap],
  );

  const handleStatusChange = useCallback((memberId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({ ...prev, [memberId]: status }));
  }, []);

  const handleNoteChange = useCallback((memberId: string, text: string) => {
    setNotes((prev) => ({ ...prev, [memberId]: text }));
  }, []);

  const handleVisitorStatus = useCallback((tempId: string, status: AttendanceStatus) => {
    setVisitors((prev) => prev.map((visitor) => (visitor.tempId === tempId ? { ...visitor, status } : visitor)));
  }, []);

  const handleVisitorRemove = useCallback((tempId: string) => {
    setVisitors((prev) => prev.filter((visitor) => visitor.tempId !== tempId));
  }, []);

  const handleAddVisitor = useCallback(() => {
    if (!selectedDate) {
      setError("출석부를 먼저 선택해 주세요.");
      return;
    }
    if (!newVisitorName.trim()) {
      setError("새가족 이름을 입력해 주세요.");
      return;
    }
    setVisitors((prev) => [...prev, createVisitor(newVisitorName.trim())]);
    setNewVisitorName("");
    setError(null);
  }, [newVisitorName, selectedDate]);

  const bulkUpdate = useCallback(
    (status: AttendanceStatus) => {
      const updated: Record<string, AttendanceStatus> = {};
      members.forEach((member) => {
        updated[member.id] = status;
      });
      setStatusMap(updated);
    },
    [members],
  );

  const handleCreateSession = useCallback(async () => {
    if (!newSessionDate) {
      setError("예배 날짜를 선택해 주세요.");
      return;
    }
    setCreatingSession(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newSessionDate, title: newSessionTitle || undefined }),
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (authEnabled && response.status === 401) {
        handleAuthFailure();
        return;
      }
      if (!response.ok) {
        throw new Error((data as { message?: string }).message || "출석부 생성에 실패했습니다.");
      }
      const session = data.session as AttendanceSession;
      setSessions((prev) => sortSessions([...prev.filter((item) => item.id !== session.id), session]));
      setSelectedDate(session.date);
      setMessage("새 출석부가 생성되었습니다.");
      setNewSessionTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "출석부 생성 중 오류가 발생했습니다.");
    } finally {
      setCreatingSession(false);
    }
  }, [authEnabled, handleAuthFailure, newSessionDate, newSessionTitle]);

  const handleSave = useCallback(async () => {
    if (!selectedDate) {
      setError("출석부를 먼저 선택해 주세요.");
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const entries = [
        ...members.map((member) => ({
          memberId: member.id,
          status: statusMap[member.id] ?? DEFAULT_STATUS,
          note: notes[member.id],
        })),
        ...visitors.map((visitor) => ({
          displayName: visitor.name,
          status: visitor.status,
          isVisitor: true,
        })),
      ];

      const response = await fetch("/api/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, entries }),
        credentials: "include",
      });

      if (authEnabled && response.status === 401) {
        handleAuthFailure();
        return;
      }
      if (!response.ok) {
        throw new Error("저장에 실패했습니다.");
      }

      setMessage("출석이 저장되었습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }, [authEnabled, handleAuthFailure, members, notes, selectedDate, statusMap, visitors]);

  const handleLogout = useCallback(async () => {
    if (!authEnabled) {
      return;
    }
    await fetch("/api/session", { method: "DELETE", credentials: "include" });
    handleAuthFailure();
  }, [authEnabled, handleAuthFailure]);

  const handlePrayerScheduleChange = useCallback((scheduleId: string) => {
    if (scheduleId && cellFilterId) {
      router.push(`/cell/prayer?schedule=${scheduleId}&cell=${cellFilterId}`);
    }
  }, [cellFilterId, router]);

  const statusButtonClass = (isActive: boolean) =>
    `rounded-md border px-3 py-1 text-sm transition ${
      isActive ? "bg-sky-600 text-white border-sky-600" : "border-slate-300 text-slate-700"
    }`;

  const handleDownloadPdf = useCallback(() => {
    if (!selectedDate) {
      setError("출석부를 먼저 선택해 주세요.");
      return;
    }
    const doc = new jsPDF();
    const startY = 20;
    const marginX = 14;
    doc.setFontSize(16);
    doc.text("2청년부 출석부", marginX, startY);
    doc.setFontSize(11);
    doc.text(`예배 날짜: ${selectedDate}`, marginX, startY + 8);
    doc.text(`온라인: ${computedSummary.online}명`, marginX, startY + 16);
    doc.text(`오프라인: ${computedSummary.offline}명`, marginX, startY + 24);
    doc.text(`결석: ${computedSummary.absent}명`, marginX, startY + 32);
    doc.text(`총원: ${computedSummary.total}명`, marginX, startY + 40);

    const rows = [
      ...members.map((member) => ({
        name: member.name,
        status: STATUS_LABEL_MAP[statusMap[member.id] ?? DEFAULT_STATUS],
        note: notes[member.id]?.trim() ?? "",
      })),
      ...visitors.map((visitor) => ({
        name: `${visitor.name} (방문)`,
        status: STATUS_LABEL_MAP[visitor.status],
        note: "",
      })),
    ];

    let y = startY + 55;
    const lineHeight = 6;
    doc.setFontSize(12);
    doc.text("상세 명단", marginX, y - 4);
    rows.forEach((row, index) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
        doc.setFontSize(12);
        doc.text("상세 명단 (계속)", marginX, y - 4);
      }
      doc.setFontSize(11);
      doc.text(`${index + 1}. ${row.name}`, marginX, y);
      doc.text(row.status, marginX + 70, y);
      if (row.note) {
        const wrapped = doc.splitTextToSize(`메모: ${row.note}`, 120);
        doc.text(wrapped, marginX, y + lineHeight - 2);
        y += Math.max(lineHeight, wrapped.length * 5);
      } else {
        y += lineHeight;
      }
    });

    doc.save(`rollbook-${selectedDate}.pdf`);
  }, [computedSummary, members, notes, selectedDate, statusMap, visitors]);

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {mode === "admin" ? "2청년부 출석부" : "출석 제출"}
          </h1>
          {mode === "admin" && (
            <p className="text-sm text-slate-600">
              온라인 / 오프라인 / 결석 상태를 빠르게 기록하세요.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:min-w-[280px]">
          {mode === "admin" && (
            <label className="text-sm font-medium text-slate-600" htmlFor="session-select">
              출석부 선택
            </label>
          )}
          {sessionsLoading ? (
            mode === "admin" ? <p className="text-sm text-slate-600">출석부 목록을 불러오는 중...</p> : null
          ) : sessions.length > 0 || prayerSchedules.length > 0 ? (
            mode === "cell" ? (
              <select
                id="combined-select"
                value=""
                onChange={(event) => {
                  const value = event.target.value;
                  if (value.startsWith("session:")) {
                    setSelectedDate(value.replace("session:", ""));
                  } else if (value.startsWith("prayer:")) {
                    handlePrayerScheduleChange(value.replace("prayer:", ""));
                  }
                }}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="" disabled>
                  선택하세요
                </option>
                {sessions.length > 0 && (
                  <optgroup label="출석부">
                    {sessions.map((session) => (
                      <option key={session.id} value={`session:${session.date}`}>
                        {renderSessionLabel(session)}
                      </option>
                    ))}
                  </optgroup>
                )}
                {prayerSchedules.length > 0 && (
                  <optgroup label="기도회">
                    {prayerSchedules.map((schedule) => (
                      <option key={schedule.id} value={`prayer:${schedule.id}`}>
                        {schedule.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            ) : (
              <select
                id="session-select"
                value={selectedDate ?? ""}
                onChange={(event) => setSelectedDate(event.target.value || null)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="" disabled>
                  출석부를 선택하세요
                </option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.date}>
                    {renderSessionLabel(session)}
                  </option>
                ))}
              </select>
            )
          ) : (
            mode === "admin" ? <p className="text-sm text-rose-600">아직 생성된 출석부가 없습니다.</p> : null
          )}
          {mode === "admin" && (
            <>
              <Link
                href="/admin/sessions"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center transition hover:border-slate-500"
              >
                출석부 관리
              </Link>
              <Link
                href="/admin/prayer"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center transition hover:border-slate-500"
              >
                기도회 관리
              </Link>
              <Link
                href="/admin/members"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center transition hover:border-slate-500"
              >
                교인 관리
              </Link>
              <Link
                href="/admin/cells"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center transition hover:border-slate-500"
              >
                셀 관리
              </Link>
              <Link
                href="/admin/users"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 text-center transition hover:border-slate-500"
              >
                계정 관리
              </Link>
              <Link
                href="/docs"
                className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 text-center transition hover:border-amber-400 hover:bg-amber-100"
              >
                📖 사용법
              </Link>
              <Link
                href="/bugs"
                className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 text-center transition hover:border-rose-400 hover:bg-rose-100"
              >
                🐛 버그 리포트
              </Link>
            </>
          )}
          {mode === "cell" && (
            <>
              <Link
                href="/docs"
                className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 text-center transition hover:border-amber-400 hover:bg-amber-100"
              >
                📖 사용법
              </Link>
              <Link
                href="/bugs"
                className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 text-center transition hover:border-rose-400 hover:bg-rose-100"
              >
                🐛 버그 리포트
              </Link>
            </>
          )}
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

      {/* Cell 모드: 요약 카드 */}
      {mode === "cell" && (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600">온라인</p>
            <p className="text-3xl font-semibold text-sky-600">{computedSummary.online}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600">오프라인</p>
            <p className="text-3xl font-semibold text-emerald-600">{computedSummary.offline}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600">결석</p>
            <p className="text-3xl font-semibold text-rose-600">{computedSummary.absent}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600">등록 인원</p>
            <p className="text-3xl font-semibold text-slate-800">{computedSummary.total}</p>
          </div>
        </div>
      )}

      {/* Admin 모드: 출석부 목록 */}
      {mode === "admin" && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">출석부 목록</h2>
            <Link
              href="/admin/sessions"
              className="text-sm text-sky-600 hover:text-sky-700"
            >
              관리하기 →
            </Link>
          </div>
          {sessionsLoading ? (
            <p className="mt-4 text-sm text-slate-600">출석부 목록을 불러오는 중...</p>
          ) : sessions.length === 0 ? (
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
      )}

      {/* Admin 모드: 기도회 목록 */}
      {mode === "admin" && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">기도회 목록</h2>
            <Link
              href="/admin/prayer"
              className="text-sm text-sky-600 hover:text-sky-700"
            >
              관리하기 →
            </Link>
          </div>
          {prayerSchedulesLoading ? (
            <p className="mt-4 text-sm text-slate-600">기도회 목록을 불러오는 중...</p>
          ) : prayerSchedules.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">생성된 기도회가 없습니다.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {prayerSchedules.map((schedule) => (
                <li
                  key={schedule.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-700">{schedule.name}</p>
                    <p className="text-sm text-slate-600">{schedule.startDate} ~ {schedule.endDate}</p>
                  </div>
                  <span className="text-xs text-slate-600">
                    {schedule.times.length}개 시간대
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Cell 모드: 셀별 출석 체크 */}
      {mode === "cell" && (cellsLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">셀 배치 정보를 불러오는 중...</p>
        </div>
      ) : cells.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          등록된 셀 정보가 없습니다.
        </div>
      ) : (
        <div className="space-y-6">
          {loading && selectedDate && (
            <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              출석 정보를 불러오는 중...
            </p>
          )}
          {cells.map((cell) => {
            const summary = getCellSummary(cell);
            const submitted = isCellSubmitted(cell);
            return (
              <article
                key={cell.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{cell.number}셀 - {cell.name}</h2>
                  </div>
                  <div className="flex flex-col gap-2 text-right sm:items-end">
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                        submitted
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {submitted ? "제출 완료" : "미제출"}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
                      {cell.roster.length}명
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs font-semibold text-slate-600">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-[11px]">온라인</p>
                    <p className="text-base text-sky-600">{summary.online}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-[11px]">오프라인</p>
                    <p className="text-base text-emerald-600">{summary.offline}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-[11px]">결석</p>
                    <p className="text-base text-rose-600">{summary.absent}</p>
                  </div>
                </div>
                {cell.roster.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">아직 배정된 셀원이 없습니다.</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                  {cell.roster.map((entry, index) => {
                    const member = entry.member;
                    const memberId = member?.id;
                    const statusValue = memberId ? statusMap[memberId] ?? DEFAULT_STATUS : DEFAULT_STATUS;
                    const controlsDisabled = !selectedDate || !memberId;
                    return (
                      <li key={`${cell.id}-${memberId ?? index}`} className="rounded-xl border border-slate-100 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-base font-semibold text-slate-900">{member?.name ?? "미등록 구성원"}</p>
                            <p className="text-xs text-slate-600">
                              {CELL_ROLE_LABEL[entry.role]} · {member?.role ?? "직분 미지정"}
                            </p>
                          </div>
                          {member?.team && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {member.team}
                            </span>
                          )}
                        </div>
                        {memberId ? (
                          <>
                            <div className="mt-4 space-y-2 sm:flex sm:items-center sm:gap-3">
                              <select
                                className="block w-full rounded-md border border-slate-300 px-2 py-2 text-sm focus:border-sky-500 focus:outline-none sm:hidden"
                                value={statusValue}
                                disabled={controlsDisabled}
                                onChange={(event) =>
                                  handleStatusChange(memberId, event.target.value as AttendanceStatus)
                                }
                              >
                                {STATUS_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <div className="hidden flex-wrap gap-2 sm:flex">
                                {STATUS_OPTIONS.map((option) => (
                                  <button
                                    type="button"
                                    key={option.value}
                                    disabled={controlsDisabled}
                                    onClick={() => handleStatusChange(memberId, option.value)}
                                    className={statusButtonClass(statusValue === option.value)}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="mt-3">
                              <input
                                type="text"
                                value={notes[memberId] ?? ""}
                                placeholder="메모"
                                disabled={controlsDisabled}
                                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none disabled:bg-slate-50"
                                onChange={(event) => handleNoteChange(memberId, event.target.value)}
                              />
                            </div>
                          </>
                        ) : (
                          <p className="mt-3 text-sm text-rose-500">멤버 정보가 연결되지 않았습니다.</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </article>
          );
        })}
      </div>
      ))}

      {mode === "admin" && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-700">새가족 / 방문자</h2>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newVisitorName}
              onChange={(event) => setNewVisitorName(event.target.value)}
              placeholder="이름 입력"
              className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddVisitor}
              disabled={!selectedDate}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              추가
            </button>
          </div>
          {visitors.length > 0 && (
            <ul className="mt-4 space-y-3">
              {visitors.map((visitor) => (
                <li key={visitor.tempId} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{visitor.name}</p>
                    <p className="text-xs text-slate-600">방문자</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleVisitorStatus(visitor.tempId, option.value)}
                        className={statusButtonClass(visitor.status === option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleVisitorRemove(visitor.tempId)}
                      className="text-sm text-rose-500 hover:text-rose-600"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {(error || message) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            error ? "border-rose-300 bg-rose-50 text-rose-700" : "border-emerald-300 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}

      {mode === "admin" && (
        <p className="text-xs text-slate-600">
          각 셀 출석을 모두 체크한 뒤 아래 <strong>출석 저장</strong> 버튼을 눌러 제출하세요.
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {mode === "admin" && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={!selectedDate}
            className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            PDF 다운로드
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !selectedDate}
          className="rounded-md bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "저장 중..." : mode === "admin" ? "출석 저장" : "출석 제출"}
        </button>
      </div>
    </section>
  );
}
