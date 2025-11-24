import { promises as fs } from "fs";
import path from "path";
import type { PrayerSchedule, PrayerCheckEntry, PrayerTime } from "@/types/prayer";

const dataDir = path.join(process.cwd(), "data");
const schedulesFile = path.join(dataDir, "prayer-schedules.json");
const checksFile = path.join(dataDir, "prayer-checks.json");

interface SchedulesFile {
  schedules: PrayerSchedule[];
}

interface ChecksFile {
  checks: PrayerCheckEntry[];
}

const DEFAULT_SCHEDULES: SchedulesFile = { schedules: [] };
const DEFAULT_CHECKS: ChecksFile = { checks: [] };

async function readSchedulesFile(): Promise<SchedulesFile> {
  try {
    const raw = await fs.readFile(schedulesFile, "utf-8");
    return JSON.parse(raw) as SchedulesFile;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(schedulesFile, JSON.stringify(DEFAULT_SCHEDULES, null, 2), "utf-8");
      return DEFAULT_SCHEDULES;
    }
    throw error;
  }
}

async function readChecksFile(): Promise<ChecksFile> {
  try {
    const raw = await fs.readFile(checksFile, "utf-8");
    return JSON.parse(raw) as ChecksFile;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(checksFile, JSON.stringify(DEFAULT_CHECKS, null, 2), "utf-8");
      return DEFAULT_CHECKS;
    }
    throw error;
  }
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getPrayerSchedules(): Promise<PrayerSchedule[]> {
  const file = await readSchedulesFile();
  return file.schedules.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export async function getPrayerScheduleById(id: string): Promise<PrayerSchedule | undefined> {
  const file = await readSchedulesFile();
  return file.schedules.find((s) => s.id === id);
}

export async function createPrayerSchedule(
  name: string,
  startDate: string,
  endDate: string,
  times: Omit<PrayerTime, "id">[]
): Promise<PrayerSchedule> {
  const file = await readSchedulesFile();
  const now = new Date().toISOString();

  const schedule: PrayerSchedule = {
    id: createId(),
    name,
    startDate,
    endDate,
    times: times.map((t) => ({ ...t, id: createId() })),
    createdAt: now,
    updatedAt: now,
  };

  file.schedules.push(schedule);
  await fs.writeFile(schedulesFile, JSON.stringify(file, null, 2), "utf-8");
  return schedule;
}

export async function getPrayerChecks(scheduleId: string, cellId?: string): Promise<PrayerCheckEntry[]> {
  const file = await readChecksFile();
  let checks = file.checks.filter((c) => c.scheduleId === scheduleId);

  if (cellId) {
    checks = checks.filter((c) => c.cellId === cellId);
  }

  return checks;
}

export async function savePrayerChecks(
  scheduleId: string,
  cellId: string,
  entries: Array<{
    memberId: string;
    memberName: string;
    date: string;
    timeId: string;
    checked: boolean;
    note?: string;
  }>
): Promise<void> {
  const file = await readChecksFile();
  const now = new Date().toISOString();

  // Remove existing entries for this schedule/cell combination
  file.checks = file.checks.filter(
    (c) => !(c.scheduleId === scheduleId && c.cellId === cellId)
  );

  // Add new entries
  for (const entry of entries) {
    const check: PrayerCheckEntry = {
      id: createId(),
      scheduleId,
      cellId,
      memberId: entry.memberId,
      memberName: entry.memberName,
      date: entry.date,
      timeId: entry.timeId,
      checked: entry.checked,
      note: entry.note,
      createdAt: now,
      updatedAt: now,
    };
    file.checks.push(check);
  }

  await fs.writeFile(checksFile, JSON.stringify(file, null, 2), "utf-8");
}

export async function getAllPrayerChecks(): Promise<PrayerCheckEntry[]> {
  const file = await readChecksFile();
  return file.checks;
}
