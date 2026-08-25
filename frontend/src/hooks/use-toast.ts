import { useCallback, useState } from "react";

export interface Toast {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

let counter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (message: string, opts?: { actionLabel?: string; onAction?: () => void }) => {
      const id = ++counter;
      setToasts((t) => [
        ...t,
        { id, message, actionLabel: opts?.actionLabel, onAction: opts?.onAction },
      ]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  return { toasts, show, dismiss };
}
