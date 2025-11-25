export type BugStatus = "open" | "in_progress" | "resolved" | "closed";
export type BugPriority = "low" | "medium" | "high" | "critical";
export type FeedbackType = "bug" | "feature" | "improvement";

export interface BugReport {
  id: string;
  title: string;
  description: string;
  status: BugStatus;
  priority: BugPriority;
  type: FeedbackType;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  adminNote?: string;
}

export interface CreateBugPayload {
  title: string;
  description: string;
  priority?: BugPriority;
  type?: FeedbackType;
  reporter: string;
}

export interface UpdateBugPayload {
  id: string;
  title?: string;
  description?: string;
  status?: BugStatus;
  priority?: BugPriority;
  type?: FeedbackType;
  adminNote?: string;
}
