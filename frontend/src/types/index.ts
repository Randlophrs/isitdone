export type Frequency = "daily" | "weekly" | "monthly";

export interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  createdAt: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  frequency: Frequency;
  timezone: string | null;
  resetTime: string | null;
  weekday: number | null;
  monthweek: number | null;
  isActive: boolean;
  isPinned: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface Completion {
  id: string;
  routineId: string;
  periodKey: string;
  completedAt: string;
}

export interface DashboardRoutine {
  id: string;
  name: string;
  description: string | null;
  frequency: Frequency;
  categoryId: string | null;
  categoryName: string;
  color: string | null;
  icon: string | null;
  isPinned: boolean;
  timezone: string | null;
  weekday: number | null;
  monthweek: number | null;
  resetTime: string | null;
  periodKey: string;
  isCompleted: boolean;
  isSkipped: boolean;
  freezeUsedThisWeek: boolean;
  completedAt: string | null;
}

export interface DashboardGroup {
  category: string;
  routines: DashboardRoutine[];
}

export interface Dashboard {
  date: string;
  week: string;
  month: string;
  progress: { completed: number; total: number; percentage: number };
  groups: DashboardGroup[];
}

export interface RoutineStats {
  routineId: string;
  frequency: Frequency;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  periodsElapsed: number;
  periodsCompleted: number;
}

export interface OverallStats {
  overallCompletionRate: number;
  routines: RoutineStats[];
}

export interface HealthResponse {
  status: string;
  app: string;
  timezone: string;
}
