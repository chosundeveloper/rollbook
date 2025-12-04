import type { BugReport, BugStatus, BugPriority } from "@/types/bug";

const TRACKER_API_BASE = process.env.TRACKER_API_URL || "http://tracker25.duckdns.org/api";
const TRACKER_API_KEY = process.env.TRACKER_API_KEY || "pt_FDcg70xwuY7Ty4MAlEcSlutt";

// Status mapping: rollbook -> tracker25
type TrackerStatus = "backlog" | "selected" | "inProgress" | "inReview" | "done";
const statusToTracker: Record<BugStatus, TrackerStatus> = {
  open: "backlog",
  in_progress: "inProgress",
  resolved: "inReview",
  closed: "done",
};

// Priority mapping: rollbook -> tracker25
type TrackerPriority = "low" | "medium" | "high" | "blocker";
const priorityToTracker: Record<BugPriority, TrackerPriority> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "blocker",
};

export interface TrackerIssue {
  id?: number;
  key?: string;
  title: string;
  description?: string;
  status: TrackerStatus;
  priority: TrackerPriority;
  assignee?: string;
}

/**
 * 이슈 목록 조회
 */
export async function fetchTrackerIssues(): Promise<TrackerIssue[]> {
  const response = await fetch(`${TRACKER_API_BASE}/issues`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch issues: ${response.status} ${text}`);
  }

  const { data } = await response.json();
  return data;
}

/**
 * 이슈 생성
 */
export async function createTrackerIssue(issue: {
  title: string;
  description?: string;
  status: TrackerStatus;
  priority: TrackerPriority;
  assignee?: string;
}): Promise<TrackerIssue> {
  const response = await fetch(`${TRACKER_API_BASE}/issues`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": TRACKER_API_KEY,
    },
    body: JSON.stringify(issue),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create issue: ${response.status} ${text}`);
  }

  const { data } = await response.json();
  return data;
}

/**
 * BugReport를 tracker25로 동기화
 */
export async function syncBugToTracker(bug: BugReport): Promise<void> {
  try {
    await createTrackerIssue({
      title: bug.title,
      description: bug.description,
      status: statusToTracker[bug.status],
      priority: priorityToTracker[bug.priority],
      assignee: bug.reporter,
    });
    console.log(`[tracker-sync] Bug ${bug.id} synced successfully`);
  } catch (error) {
    console.error("[tracker-sync] Failed to sync bug:", error);
  }
}
