// Prayer meeting checklist types

export interface PrayerSchedule {
  id: string;
  name: string; // 기도회 명 (예: "신년 새벽기도회")
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  times: PrayerTime[]; // 시간대들 (오전 8시, 오후 8시 등)
  createdAt: string;
  updatedAt: string;
}

export interface PrayerTime {
  id: string;
  label: string; // "오전 8시", "오후 8시" 등
  time: string; // "08:00", "20:00" 등
}

export interface PrayerCheckEntry {
  id: string;
  scheduleId: string;
  cellId: string;
  memberId: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  timeId: string; // PrayerTime의 id
  checked: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrayerSchedulePayload {
  name: string;
  startDate: string;
  endDate: string;
  times: Omit<PrayerTime, "id">[];
}

export interface UpdatePrayerCheckPayload {
  scheduleId: string;
  cellId: string;
  entries: {
    memberId: string;
    memberName: string;
    date: string;
    timeId: string;
    checked: boolean;
    note?: string;
  }[];
}

export interface PrayerCheckSummary {
  scheduleId: string;
  scheduleName: string;
  totalDays: number;
  totalSlots: number; // days × times
  cellSummaries: {
    cellId: string;
    cellName: string;
    memberCount: number;
    checkCount: number; // 총 체크된 수
    completionRate: number; // 완료율 %
  }[];
}
