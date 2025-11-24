import { promises as fs } from "fs";
import path from "path";
import { CellRecord, CellRole, Member } from "@/types/attendance";
import { getMembers } from "@/lib/data-store";

const dataDir = path.join(process.cwd(), "data");
const cellsFilePath = path.join(dataDir, "cells.json");

interface CellsFile {
  cells: CellRecord[];
}

const DEFAULT_CELLS: CellsFile = { cells: [] };

async function readCellsFile(): Promise<CellsFile> {
  try {
    const raw = await fs.readFile(cellsFilePath, "utf-8");
    return JSON.parse(raw) as CellsFile;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(cellsFilePath, JSON.stringify(DEFAULT_CELLS, null, 2), "utf-8");
      return DEFAULT_CELLS;
    }
    throw error;
  }
}

export interface HydratedCellMember {
  member?: Member;
  role: CellRole;
}

export interface HydratedCell extends CellRecord {
  roster: HydratedCellMember[];
}

export async function getCells(): Promise<CellRecord[]> {
  const file = await readCellsFile();
  return file.cells;
}

export async function getCellsWithMembers(): Promise<HydratedCell[]> {
  const [cells, members] = await Promise.all([getCells(), getMembers()]);
  const memberMap = new Map(members.map((member) => [member.id, member] as const));

  return cells.map((cell) => ({
    ...cell,
    roster: (cell.members || []).map((assignment) => ({
      role: assignment.role,
      member: memberMap.get(assignment.memberId),
    })),
  }));
}

function createId(): string {
  return `cell-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function writeCellsFile(file: CellsFile): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(cellsFilePath, JSON.stringify(file, null, 2), "utf-8");
}

export async function createCell(leaderId: string, leaderName: string): Promise<CellRecord> {
  const file = await readCellsFile();

  // 다음 셀 번호 계산
  const maxNumber = file.cells.reduce((max, c) => Math.max(max, c.number || 0), 0);
  const nextNumber = maxNumber + 1;

  const cell: CellRecord = {
    id: createId(),
    number: nextNumber,
    name: `${leaderName}셀`,
    leaderId,
    members: [{ memberId: leaderId, role: "leader" }],
  };
  file.cells.push(cell);
  await writeCellsFile(file);
  return cell;
}

export async function updateCell(id: string, leaderId: string, leaderName: string): Promise<CellRecord | null> {
  const file = await readCellsFile();
  const index = file.cells.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const cell = file.cells[index];

  // 기존 셀장 제거하고 새 셀장 추가
  const membersWithoutOldLeader = (cell.members || []).filter(
    (m) => m.memberId !== cell.leaderId && m.role !== "leader"
  );

  file.cells[index] = {
    ...cell,
    name: `${leaderName}셀`,
    leaderId,
    members: [{ memberId: leaderId, role: "leader" }, ...membersWithoutOldLeader],
  };
  await writeCellsFile(file);
  return file.cells[index];
}

export async function deleteCell(id: string): Promise<boolean> {
  const file = await readCellsFile();
  const index = file.cells.findIndex((c) => c.id === id);
  if (index === -1) return false;

  file.cells.splice(index, 1);
  await writeCellsFile(file);
  return true;
}

export async function addMemberToCell(
  cellId: string,
  memberId: string,
  role: CellRole
): Promise<CellRecord | null> {
  const file = await readCellsFile();
  const cell = file.cells.find((c) => c.id === cellId);
  if (!cell) return null;

  if (!cell.members) cell.members = [];

  // Remove if already exists (to update role)
  cell.members = cell.members.filter((m) => m.memberId !== memberId);
  cell.members.push({ memberId, role });

  await writeCellsFile(file);
  return cell;
}

export async function removeMemberFromCell(cellId: string, memberId: string): Promise<boolean> {
  const file = await readCellsFile();
  const cell = file.cells.find((c) => c.id === cellId);
  if (!cell || !cell.members) return false;

  const before = cell.members.length;
  cell.members = cell.members.filter((m) => m.memberId !== memberId);
  if (cell.members.length === before) return false;

  await writeCellsFile(file);
  return true;
}
