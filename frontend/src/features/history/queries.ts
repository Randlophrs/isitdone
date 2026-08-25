import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useHistory() {
  return useQuery({ queryKey: ["history"], queryFn: api.history });
}

export function useHistoryMonth(year: number, month: number) {
  return useQuery({
    queryKey: ["history", year, month],
    queryFn: () => api.historyMonth(year, month),
  });
}

export function useHistoryRoutine(routineId: string) {
  return useQuery({
    queryKey: ["history", "routine", routineId],
    queryFn: () => api.historyRoutine(routineId),
    enabled: Boolean(routineId),
  });
}
