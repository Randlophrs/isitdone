import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useOverallStats() {
  return useQuery({ queryKey: ["stats", "overall"], queryFn: api.overallStats });
}
