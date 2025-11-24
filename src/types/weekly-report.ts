// Weekly report types

export interface WeeklyReport {
  id: string;
  cellId: string;
  weekStartDate: string; // 주의 시작일 (월요일 기준, YYYY-MM-DD)
  weekEndDate: string; // 주의 종료일 (일요일 기준, YYYY-MM-DD)
  memberReports: MemberReport[];
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberReport {
  memberId: string;
  memberName: string;
  comment: string; // 셀원에 대한 코멘트
}

export interface CreateWeeklyReportPayload {
  cellId: string;
  weekStartDate: string;
  memberReports: {
    memberId: string;
    memberName: string;
    comment: string;
  }[];
}

export interface WeeklyReportSummary {
  weekStartDate: string;
  weekEndDate: string;
  cellReports: {
    cellId: string;
    cellName: string;
    submitted: boolean;
    submittedAt?: string;
  }[];
}
