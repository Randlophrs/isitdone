import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Category, Dashboard, Routine } from "@/types";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: api.dashboard,
  });
}

export function useRoutines(includeArchived = false) {
  return useQuery({
    queryKey: ["routines", includeArchived],
    queryFn: () => api.listRoutines(includeArchived),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: api.listCategories,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Category>) => api.createCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCategoryUsage(id: string | null) {
  return useQuery({
    queryKey: ["category-usage", id],
    queryFn: () => api.categoryUsage(id as string),
    enabled: !!id,
  });
}

export function useCompleteRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["routines"] });
    },
  });
}

export function useUncompleteRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.uncomplete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["routines"] });
    },
  });
}

export function useSkipRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.skip(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}

export function useUnskipRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.unskip(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}

export function useCreateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Routine>) => api.createRoutine(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Routine> }) =>
      api.updateRoutine(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useArchiveRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.archiveRoutine(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routines"] }),
  });
}

export function useDeleteRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRoutine(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function invalidateDashboard() {
  return ["dashboard"];
}

export type { Dashboard };
