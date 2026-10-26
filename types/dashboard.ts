export interface Dashboard {
  totalCases: number;
  activeCases: number;
  totalDocuments: number;
  totalOutstanding: number;
  unreadNotificationCount: number;
  upcomingDeadlines: UpcomingDeadline[];
  recentActivity: RecentActivity[];
}

/** Court events only ("Court proceeding added", "Appeal filed", …), never staff names. */
export interface RecentActivity {
  id: string;
  action: string;
  description: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
}

export interface UpcomingDeadline {
  id: string;
  caseId: string;
  caseTitle: string;
  caseNumber: string;
  title: string;
  dueDate: string;
  completed: boolean;
}
