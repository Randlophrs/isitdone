import { useToast } from "@/hooks/use-toast";

export function ToastHost({
  toasts,
  onDismiss,
}: {
  toasts: ReturnType<typeof useToast>["toasts"];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-auto flex max-w-md flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="card flex items-center justify-between gap-3 px-4 py-3 shadow-lg"
          role="status"
        >
          <span className="text-sm">{t.message}</span>
          {t.actionLabel && (
            <button
              className="text-sm font-semibold text-accent"
              onClick={() => {
                t.onAction?.();
                onDismiss(t.id);
              }}
            >
              {t.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
