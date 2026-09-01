import { useEffect, useState } from "react";

export interface Toast {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

let counter = 0;
// ponytail: module-level store so any page can show toasts without
// remounting the host. Single source for ToastHost at app shell.
let toasts: Toast[] = [];
const listeners = new Set<(t: Toast[]) => void>();

function emit() {
  for (const l of listeners) l(toasts);
}

export function showToast(
  message: string,
  opts?: { actionLabel?: string; onAction?: () => void },
) {
  const id = ++counter;
  toasts = [...toasts, { id, message, actionLabel: opts?.actionLabel, onAction: opts?.onAction }].slice(-3);
  emit();
  setTimeout(() => dismissToast(id), 3000);
}

export function dismissToast(id: number) {
  const next = toasts.filter((x) => x.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
}

export function useToasts() {
  const [t, setT] = useState<Toast[]>(toasts);
  useEffect(() => {
    listeners.add(setT);
    return () => {
      listeners.delete(setT);
    };
  }, []);
  return t;
}

// ponytail: kept for back-compat with existing DashboardPage callers.
export function useToast() {
  return { toasts: useToasts(), show: showToast, dismiss: dismissToast };
}