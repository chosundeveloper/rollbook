import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  AttendanceEntry,
  AttendancePayloadEntry,
  AttendanceSession,
  AttendanceStatus,
  AttendanceSummary,
  CreateSessionPayload,
  Member,
  NewMemberPayload,
} from "@/types/attendance";

const dataDir = path.join(process.cwd(), "data");
const membersFilePath = path.join(dataDir, "members.json");
const attendanceFilePath = path.join(dataDir, "attendance.json");
const sessionsFilePath = path.join(dataDir, "sessions.json");

interface MembersFile {
  members: Member[];
}

interface AttendanceFile {
  entries: AttendanceEntry[];
}

interface SessionsFile {
  sessions: AttendanceSession[];
}

const DEFAULT_MEMBERS: MembersFile = { members: [] };
const DEFAULT_ATTENDANCE: AttendanceFile = { entries: [] };
const DEFAULT_SESSIONS: SessionsFile = { sessions: [] };

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
      return defaultValue;
    }
    throw error;
  }
}

async function writeJsonFile<T>(filePath: string, payload: T) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");
}

export async function getMembers(): Promise<Member[]> {
  const file = await readJsonFile<MembersFile>(membersFilePath, DEFAULT_MEMBERS);
  return file.members
    .filter((member) => member.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function addMember(payload: NewMemberPayload): Promise<Member> {
  if (!payload.name?.trim()) {
    throw new Error("Name is required");
  }

  const members = await readJsonFile<MembersFile>(membersFilePath, DEFAULT_MEMBERS);
  const now = new Date();
  const newMember: Member = {
    id: `mem-${randomUUID()}`,
    name: payload.name.trim(),
    birthYear: payload.birthYear || undefined,
    team: payload.team?.trim() || undefined,
    contact: payload.contact?.trim() || undefined,
    role: payload.role?.trim() || undefined,
    isActive: true,
    joinedAt: payload.joinedAt?.trim() || now.toISOString().slice(0, 10),
  };

  members.members.push(newMember);
  members.members.sort((a, b) => a.name.localeCompare(b.name));
  await writeJsonFile(membersFilePath, members);

  return newMember;
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  const members = await readJsonFile<MembersFile>(membersFilePath, DEFAULT_MEMBERS);
  return members.members.find((member) => member.id === id);
}

const VALID_STATUSES: AttendanceStatus[] = ["online", "offline", "absent"];

function normalizeDate(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Date must be formatted as YYYY-MM-DD");
  }
  return date;
}

function assertStatus(status: string): asserts status is AttendanceStatus {
  if (!VALID_STATUSES.includes(status as AttendanceStatus)) {
    throw new Error(`Unsupported attendance status: ${status}`);
  }
}

async function ensureSessionExists(date: string) {
  const sessions = await readJsonFile<SessionsFile>(sessionsFilePath, DEFAULT_SESSIONS);
  if (!sessions.sessions.some((session) => session.date === date)) {
    throw new Error("해당 날짜의 출석부가 존재하지 않습니다. 먼저 생성해 주세요.");
  }
}

export async function getAttendanceByDate(date: string): Promise<AttendanceEntry[]> {
  const normalized = normalizeDate(date);
  const file = await readJsonFile<AttendanceFile>(attendanceFilePath, DEFAULT_ATTENDANCE);
  const entries = file.entries || [];
  return entries.filter((entry) => entry.date === normalized);
}

async function resolveDisplayName(entry: AttendancePayloadEntry): Promise<string> {
  if (entry.memberId) {
    const member = await getMemberById(entry.memberId);
    if (member) {
      return member.name;
    }
  }
  if (entry.displayName?.trim()) {
    return entry.displayName.trim();
  }
  return "Visitor";
}

export async function replaceAttendanceForDate(
  date: string,
  entries: AttendancePayloadEntry[],
): Promise<AttendanceEntry[]> {
  const normalized = normalizeDate(date);
  await ensureSessionExists(normalized);
  const file = await readJsonFile<AttendanceFile>(attendanceFilePath, DEFAULT_ATTENDANCE);
  const existingEntries = file.entries || [];
  const others = existingEntries.filter((entry) => entry.date !== normalized);
  const nowIso = new Date().toISOString();

  const normalizedEntries: AttendanceEntry[] = await Promise.all(
    entries.map(async (entry) => {
      assertStatus(entry.status);
      return {
        id: `att-${randomUUID()}`,
        date: normalized,
        status: entry.status,
        memberId: entry.memberId,
        displayName: await resolveDisplayName(entry),
        note: entry.note?.trim() || undefined,
        isVisitor: entry.isVisitor ?? !entry.memberId,
        createdAt: nowIso,
        updatedAt: nowIso,
      } satisfies AttendanceEntry;
    }),
  );

  const updated: AttendanceFile = {
    entries: [...others, ...normalizedEntries],
  };

  await writeJsonFile(attendanceFilePath, updated);
  return normalizedEntries;
}

export function summarizeAttendance(entries: AttendanceEntry[]): AttendanceSummary {
  return entries.reduce<AttendanceSummary>(
    (acc, entry) => {
      if (entry.status === "online") acc.online += 1;
      if (entry.status === "offline") acc.offline += 1;
      if (entry.status === "absent") acc.absent += 1;
      acc.total += 1;
      return acc;
    },
    { online: 0, offline: 0, absent: 0, total: 0 },
  );
}

export async function getSessions(): Promise<AttendanceSession[]> {
  const file = await readJsonFile<SessionsFile>(sessionsFilePath, DEFAULT_SESSIONS);
  return [...file.sessions].sort((a, b) => b.date.localeCompare(a.date));
}

export async function createSession(payload: CreateSessionPayload): Promise<AttendanceSession> {
  if (!payload?.date) {
    throw new Error("날짜를 입력해 주세요.");
  }
  const normalized = normalizeDate(payload.date);
  const sessions = await readJsonFile<SessionsFile>(sessionsFilePath, DEFAULT_SESSIONS);
  if (sessions.sessions.some((session) => session.date === normalized)) {
    throw new Error("이미 존재하는 날짜입니다.");
  }
  const nowIso = new Date().toISOString();
  const newSession: AttendanceSession = {
    id: `session-${randomUUID()}`,
    date: normalized,
    title: payload.title?.trim() || undefined,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  sessions.sessions.push(newSession);
  sessions.sessions.sort((a, b) => b.date.localeCompare(a.date));
  await writeJsonFile(sessionsFilePath, sessions);
  return newSession;
}
