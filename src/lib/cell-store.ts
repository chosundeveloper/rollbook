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
