import { promises as fs } from "fs";
import path from "path";
import type { BugReport, CreateBugPayload, UpdateBugPayload, BugStatus } from "@/types/bug";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const BUGS_FILE = path.join(DATA_DIR, "bugs.json");

interface BugsData {
  bugs: BugReport[];
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

async function readBugsFile(): Promise<BugsData> {
  await ensureDataDir();
  try {
    const content = await fs.readFile(BUGS_FILE, "utf-8");
    return JSON.parse(content) as BugsData;
  } catch {
    return { bugs: [] };
  }
}

async function writeBugsFile(data: BugsData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(BUGS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function generateId(): string {
  return `bug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function getAllBugs(): Promise<BugReport[]> {
  const data = await readBugsFile();
  return data.bugs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getBugById(id: string): Promise<BugReport | null> {
  const data = await readBugsFile();
  return data.bugs.find((bug) => bug.id === id) || null;
}

export async function createBug(payload: CreateBugPayload): Promise<BugReport> {
  const data = await readBugsFile();
  const now = new Date().toISOString();

  const newBug: BugReport = {
    id: generateId(),
    title: payload.title,
    description: payload.description,
    status: "open",
    priority: payload.priority || "medium",
    type: payload.type || "bug",
    reporter: payload.reporter,
    createdAt: now,
    updatedAt: now,
  };

  data.bugs.push(newBug);
  await writeBugsFile(data);
  return newBug;
}

export async function updateBug(payload: UpdateBugPayload): Promise<BugReport | null> {
  const data = await readBugsFile();
  const index = data.bugs.findIndex((bug) => bug.id === payload.id);

  if (index === -1) {
    return null;
  }

  const now = new Date().toISOString();
  const existingBug = data.bugs[index];

  const updatedBug: BugReport = {
    ...existingBug,
    title: payload.title ?? existingBug.title,
    description: payload.description ?? existingBug.description,
    status: payload.status ?? existingBug.status,
    priority: payload.priority ?? existingBug.priority,
    type: payload.type ?? existingBug.type ?? "bug",
    adminNote: payload.adminNote ?? existingBug.adminNote,
    updatedAt: now,
  };

  // Set resolvedAt if status changed to resolved or closed
  if (payload.status === "resolved" || payload.status === "closed") {
    updatedBug.resolvedAt = now;
  }

  data.bugs[index] = updatedBug;
  await writeBugsFile(data);
  return updatedBug;
}

export async function deleteBug(id: string): Promise<boolean> {
  const data = await readBugsFile();
  const initialLength = data.bugs.length;
  data.bugs = data.bugs.filter((bug) => bug.id !== id);

  if (data.bugs.length === initialLength) {
    return false;
  }

  await writeBugsFile(data);
  return true;
}

export async function getBugsByStatus(status: BugStatus): Promise<BugReport[]> {
  const data = await readBugsFile();
  return data.bugs
    .filter((bug) => bug.status === status)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
