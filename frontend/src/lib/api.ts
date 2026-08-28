import type {
  Category,
  Completion,
  Dashboard,
  HealthResponse,
  OverallStats,
  Routine,
  RoutineStats,
} from "@/types";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${res.status}: ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<HealthResponse>("/health"),

  // dashboard
  dashboard: () => request<Dashboard>("/dashboard/current"),

  // routines
  listRoutines: (includeArchived = false) =>
    request<Routine[]>(
      `/routines${includeArchived ? "?include_archived=true" : ""}`,
    ),
  createRoutine: (data: Partial<Routine>) =>
    request<Routine>("/routines", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateRoutine: (id: string, data: Partial<Routine>) =>
    request<Routine>(`/routines/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteRoutine: (id: string) =>
    request<void>(`/routines/${id}`, { method: "DELETE" }),
  archiveRoutine: (id: string) =>
    request<Routine>(`/routines/${id}/archive`, { method: "POST" }),
  restoreRoutine: (id: string) =>
    request<Routine>(`/routines/${id}/restore`, { method: "POST" }),

  // completions
  complete: (id: string) =>
    request<Completion>(`/routines/${id}/complete`, { method: "POST" }),
  uncomplete: (id: string) =>
    request<void>(`/routines/${id}/complete`, { method: "DELETE" }),
  skip: (id: string) =>
    request<Completion>(`/routines/${id}/skip`, { method: "POST" }),
  unskip: (id: string) =>
    request<void>(`/routines/${id}/skip`, { method: "DELETE" }),
  listCompletions: (id: string) =>
    request<Completion[]>(`/routines/${id}/completions`),

  // categories
  listCategories: () => request<Category[]>("/categories"),
  createCategory: (data: Partial<Category>) =>
    request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    request<void>(`/categories/${id}`, { method: "DELETE" }),
  categoryUsage: (id: string) =>
    request<{ count: number }>(`/categories/${id}/usage`),

  // statistics
  overallStats: () => request<OverallStats>("/statistics"),
  routineStats: (id: string) =>
    request<RoutineStats>(`/statistics/routine/${id}`),

  // history
  history: () =>
    request<{
      periods: { periodKey: string; completions: { routineName: string }[] }[];
    }>("/history"),
  historyMonth: (year: number, month: number) =>
    request<unknown>(`/history/${year}/${month}`),
  historyRoutine: (id: string) =>
    request<{ routineId: string; completions: Completion[] }>(
      `/history/routine/${id}`,
    ),

  // backup
  exportBackup: () => request<unknown>("/backup/export"),
};
