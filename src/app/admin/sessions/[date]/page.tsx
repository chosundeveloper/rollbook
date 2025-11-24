"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AUTH_DISABLED } from "@/lib/auth";
import type { AttendanceEntry, AttendanceSession } from "@/types/attendance";

export default function SessionDetailPage() {
  const params = useParams();
  const date = params.date as string;
  const authEnabled = !AUTH_DISABLED;

  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load sessions and attendance in parallel
      const [sessionsRes, attendanceRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch(`/api/attendance?date=${date}`),
      ]);

      if (authEnabled && sessionsRes.status === 401) {
        handleAuthFailure();
        return;
      }

      if (!sessionsRes.ok) throw new Error("출석부 목록을 불러오지 못했습니다.");

      const sessionsData = await sessionsRes.json();

      const foundSession = sessionsData.sessions.find(
        (s: AttendanceSession) => s.date === date
      );

      if (!foundSession) {
        setError(`${date} 날짜의 출석부를 찾을 수 없습니다.`);
        setLoading(false);
        return;
      }

      setSession(foundSession);

      // Attendance data (might be empty or error if no data)
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setEntries(attendanceData.entries || []);
      } else {
        setEntries([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [authEnabled, date, handleAuthFailure]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePrint = () => {
    window.print();
  };

  // Stats
  const totalOnline = entries.filter((e) => e.status === "online").length;
  const totalOffline = entries.filter((e) => e.status === "offline").length;
  const totalAbsent = entries.filter((e) => e.status === "absent").length;
  const totalAttended = totalOnline + totalOffline;
  const totalMembers = entries.length;

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
        <p className="text-sm text-slate-600">데이터를 불러오는 중...</p>
      </section>
    );
  }

  if (error && !session) {
    return (
      <section className="mx-auto max-w-5xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
        <Link href="/admin" className="text-sm text-sky-600 hover:underline">
          ← 대시보드로 돌아가기
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-3 pb-6 pt-4 sm:px-6">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600">
              ←
            </Link>
            <h1 className="text-2xl font-semibold">{date} 출석부</h1>
          </div>
          {session?.title && (
            <p className="text-sm text-slate-600 mt-1">{session.title}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            🖨️ PDF 다운로드/인쇄
          </button>
          <Link
            href="/admin"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-500"
          >
            대시보드
          </Link>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">{date} 출석부</h1>
        {session?.title && <p className="text-sm text-slate-600">{session.title}</p>}
      </div>

      {/* Messages */}
      {(error || message) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm print:hidden ${
            error
              ? "border-rose-300 bg-rose-50 text-rose-700"
              : "border-emerald-300 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-4 print:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center print:shadow-none">
          <p className="text-3xl font-bold text-slate-700">{totalMembers}</p>
          <p className="text-sm text-slate-600">총 인원</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center print:shadow-none">
          <p className="text-3xl font-bold text-emerald-600">{totalOffline}</p>
          <p className="text-sm text-slate-600">오프라인</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center print:shadow-none">
          <p className="text-3xl font-bold text-sky-600">{totalOnline}</p>
          <p className="text-sm text-slate-600">온라인</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center print:shadow-none">
          <p className="text-3xl font-bold text-rose-600">{totalAbsent}</p>
          <p className="text-sm text-slate-600">결석</p>
        </div>
      </div>

      {/* Attendance Rate */}
      {totalMembers > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:shadow-none">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">출석률</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all print:bg-emerald-500"
                style={{
                  width: `${(totalAttended / totalMembers) * 100}%`,
                }}
              />
            </div>
            <span className="text-lg font-bold text-slate-700">
              {Math.round((totalAttended / totalMembers) * 100)}%
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {totalAttended}명 출석 / {totalMembers}명 중
          </p>
        </div>
      )}

      {/* Detailed Attendance Table - Printable */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:shadow-none print:border-0">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">전체 출석 현황</h2>

        {entries.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            아직 제출된 출석 데이터가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-200 px-3 py-2 text-left">번호</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">이름</th>
                  <th className="border border-slate-200 px-3 py-2 text-center">상태</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">메모</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={entry.id}>
                    <td className="border border-slate-200 px-3 py-2 text-slate-500 text-center">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {entry.displayName}
                      {entry.isVisitor && (
                        <span className="ml-1 text-xs text-purple-600">(방문)</span>
                      )}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-center">
                      {entry.status === "offline" && (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          오프라인
                        </span>
                      )}
                      {entry.status === "online" && (
                        <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                          온라인
                        </span>
                      )}
                      {entry.status === "absent" && (
                        <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                          결석
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-500 text-xs">
                      {entry.note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
