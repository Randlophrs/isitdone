import { dismissToast, useToasts } from "@/hooks/use-toast";

export function ToastHost() {
  const toasts = useToasts();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="card overflow-hidden shadow-lg [animation:toast-in_0.2s_ease-out]"
          role="status"
        >
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="text-sm">{t.message}</span>
            {t.actionLabel && (
              <button
                className="shrink-0 text-sm font-semibold text-accent"
                onClick={() => {
                  t.onAction?.();
                  dismissToast(t.id);
                }}
              >
                {t.actionLabel}
              </button>
            )}
          </div>
          <div className="h-0.5 w-full bg-accent/15">
            <div
              className="h-full origin-left bg-accent [animation:toast-countdown_3s_linear_forwards]"
              onAnimationEnd={() => dismissToast(t.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}