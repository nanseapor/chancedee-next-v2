export interface MonthlyPerformanceData {
  name: string;
  companies: number;
  candidates: number;
  jobs: number;
  applications: number;
  interviews: number;
}

export interface JobPosition {
  title: string;
  openings: number;
  applications: number;
}

export interface RecruitmentMetrics {
  averageDays: number;
  changeInDays: number;
  byLevel: {
    newbie: number;
    junior: number;
    senior: number;
    manager: number;
  };
}

export interface DashboardStats {
  totalCompanies: {
    count: number;
    growth: number;
  };
  totalCandidates: {
    count: number;
    growth: number;
  };
  activeJobs: {
    count: number;
    growth: number;
  };
  interviews: {
    count: number;
    growth: number;
  };
  successRate: {
    percentage: number;
    growth: number;
    total: number;
    successful: number;
  };
  bestTimeToApply: {
    period: string;
    percentage: number;
  };
  popularPositions: JobPosition[];
  recruitmentMetrics: RecruitmentMetrics;
  monthlyPerformance: MonthlyPerformanceData[];
}
