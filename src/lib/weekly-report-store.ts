import { promises as fs } from "fs";
import path from "path";
import type { WeeklyReport, MemberReport } from "@/types/weekly-report";

const dataDir = path.join(process.cwd(), "data");
const reportsFile = path.join(dataDir, "weekly-reports.json");

interface ReportsFile {
  reports: WeeklyReport[];
}

const DEFAULT_REPORTS: ReportsFile = { reports: [] };

async function readReportsFile(): Promise<ReportsFile> {
  try {
    const raw = await fs.readFile(reportsFile, "utf-8");
    return JSON.parse(raw) as ReportsFile;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(reportsFile, JSON.stringify(DEFAULT_REPORTS, null, 2), "utf-8");
      return DEFAULT_REPORTS;
    }
    throw error;
  }
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// 주어진 날짜가 속한 주의 시작일(월요일)을 반환
function getWeekStartDate(date: Date): string {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 일요일이면 -6, 아니면 월요일까지의 차이
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return formatDate(monday);
}

// 주어진 날짜가 속한 주의 종료일(일요일)을 반환
function getWeekEndDate(date: Date): string {
  const day = date.getDay();
  const diff = day === 0 ? 0 : 7 - day; // 일요일이면 0, 아니면 일요일까지의 차이
  const sunday = new Date(date);
  sunday.setDate(date.getDate() + diff);
  sunday.setHours(23, 59, 59, 999);
  return formatDate(sunday);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentWeekDates(): { startDate: string; endDate: string } {
  const today = new Date();
  return {
    startDate: getWeekStartDate(today),
    endDate: getWeekEndDate(today),
  };
}

export async function getWeeklyReports(cellId?: string): Promise<WeeklyReport[]> {
  const file = await readReportsFile();
  let reports = file.reports;

  if (cellId) {
    reports = reports.filter((r) => r.cellId === cellId);
  }

  return reports.sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));
}

export async function getWeeklyReport(
  cellId: string,
  weekStartDate: string
): Promise<WeeklyReport | undefined> {
  const file = await readReportsFile();
  return file.reports.find((r) => r.cellId === cellId && r.weekStartDate === weekStartDate);
}

export async function saveWeeklyReport(
  cellId: string,
  weekStartDate: string,
  memberReports: MemberReport[]
): Promise<WeeklyReport> {
  const file = await readReportsFile();
  const now = new Date().toISOString();

  // 해당 주의 종료일 계산
  const startDate = new Date(weekStartDate);
  const weekEndDate = getWeekEndDate(startDate);

  // 기존 보고서가 있는지 확인
  const existingIndex = file.reports.findIndex(
    (r) => r.cellId === cellId && r.weekStartDate === weekStartDate
  );

  let report: WeeklyReport;

  if (existingIndex >= 0) {
    // 기존 보고서 업데이트
    report = {
      ...file.reports[existingIndex],
      memberReports,
      submittedAt: now,
      updatedAt: now,
    };
    file.reports[existingIndex] = report;
  } else {
    // 새 보고서 생성
    report = {
      id: createId(),
      cellId,
      weekStartDate,
      weekEndDate,
      memberReports,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    file.reports.push(report);
  }

  await fs.writeFile(reportsFile, JSON.stringify(file, null, 2), "utf-8");
  return report;
}

export async function getAllWeeklyReports(): Promise<WeeklyReport[]> {
  const file = await readReportsFile();
  return file.reports;
}
