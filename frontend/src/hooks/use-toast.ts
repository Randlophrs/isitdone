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
      setToasts((t) => {
        const next = [
          ...t,
          { id, message, actionLabel: opts?.actionLabel, onAction: opts?.onAction },
        ];
        // ponytail: keep latest 3 only, FIFO drop
        return next.slice(-3);
      });
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss],
  );

  return { toasts, show, dismiss };
}
