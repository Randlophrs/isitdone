import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import type { DashboardRoutine } from "@/types";
import { cx, formatTime, frequencyLabel } from "@/lib/utils";

interface Props {
  routine: DashboardRoutine;
  onToggle: (routine: DashboardRoutine) => void;
  onDelete: (routine: DashboardRoutine) => void;
}

export function RoutineRow({ routine, onToggle, onDelete }: Props) {
  const done = routine.isCompleted;
  const [confirming, setConfirming] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirming) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setConfirming(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirming(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [confirming]);

  return (
    <div ref={rootRef} className="group relative">
      <button
        type="button"
        onClick={() => onToggle(routine)}
        aria-pressed={done}
        className={cx(
          "flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 pr-10 text-left transition-colors",
          "hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          done && "opacity-60",
        )}
      >
        <span
          className={cx(
            "flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 transition-colors",
            done
              ? "border-accent bg-accent text-white"
              : "border-muted/50 text-transparent group-hover:border-accent/60",
          )}
          aria-hidden
        >
          <Check size={15} strokeWidth={3} />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cx(
              "block truncate text-sm font-medium",
              done && "line-through",
            )}
          >
            {routine.name}
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
            <span
              className="inline-block h-2 w-2 flex-none rounded-full"
              style={{ background: routine.color ?? "rgb(var(--muted))" }}
              aria-hidden
            />
            {routine.categoryName}
            <span aria-hidden>·</span>
            {frequencyLabel(routine.frequency)}
            {routine.resetTime && routine.resetTime !== "00:00" && (
              <>
                <span aria-hidden>·</span>
                <span
                  className="rounded bg-accent/10 px-1 py-0.5 text-[10px] text-accent"
                  title={`Resets at ${routine.resetTime}`}
                >
                  ↻ {routine.resetTime}
                </span>
              </>
            )}
            {done && routine.completedAt && (
              <>
                <span aria-hidden>·</span>
                {formatTime(routine.completedAt)}
              </>
            )}
          </span>
        </span>

        {routine.isPinned && (
          <span className="text-xs text-muted" aria-label="pinned">
            📌
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${routine.name}`}
        className={cx(
          "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-muted transition-opacity",
          "hover:bg-red-500/10 hover:text-red-500 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          confirming ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <X size={15} />
      </button>

      {confirming && (
        <div
          role="dialog"
          aria-label={`Delete ${routine.name}`}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-2 top-2 z-30 w-60 rounded-lg border border-border bg-surface p-3 shadow-lg"
        >
          <p className="text-sm">
            Delete <span className="font-medium">{routine.name}</span>?
          </p>
          <p className="mt-1 text-xs text-muted">
            Its history is removed. This can’t be undone.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="btn-ghost flex-1"
              onClick={() => setConfirming(false)}
            >
              Keep
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
              onClick={() => {
                setConfirming(false);
                onDelete(routine);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
