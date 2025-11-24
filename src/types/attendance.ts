export type AttendanceStatus = "online" | "offline" | "absent";

export interface Member {
  id: string;
  name: string;
  team?: string;
  contact?: string;
  role?: string;
  isActive: boolean;
  joinedAt?: string;
}

export interface AttendanceEntry {
  id: string;
  date: string; // YYYY-MM-DD local date
  status: AttendanceStatus;
  memberId?: string;
  displayName: string;
  note?: string;
  isVisitor?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  online: number;
  offline: number;
  absent: number;
  total: number;
}

export interface AttendancePayloadEntry {
  memberId?: string;
  displayName?: string;
  status: AttendanceStatus;
  note?: string;
  isVisitor?: boolean;
}

export interface SaveAttendancePayload {
  date: string;
  entries: AttendancePayloadEntry[];
}

export interface NewMemberPayload {
  name: string;
  team?: string;
  contact?: string;
  role?: string;
  joinedAt?: string;
}

export interface AttendanceSession {
  id: string;
  date: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionPayload {
  date: string;
  title?: string;
}

export type CellRole = "leader" | "subleader" | "member";

export interface CellMemberAssignment {
  memberId: string;
  role: CellRole;
}

export interface CellRecord {
  id: string;
  name: string;
  description?: string;
  members?: CellMemberAssignment[];
  leaderId?: string;
}
