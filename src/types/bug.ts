export type BugStatus = "open" | "in_progress" | "resolved" | "closed";
export type BugPriority = "low" | "medium" | "high" | "critical";

export interface BugReport {
  id: string;
  title: string;
  description: string;
  status: BugStatus;
  priority: BugPriority;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateBugPayload {
  title: string;
  description: string;
  priority?: BugPriority;
  reporter: string;
}

export interface UpdateBugPayload {
  id: string;
  title?: string;
  description?: string;
  status?: BugStatus;
  priority?: BugPriority;
}
