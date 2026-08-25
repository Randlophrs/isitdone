import { Check } from "lucide-react";
import type { DashboardRoutine } from "@/types";
import { cx, formatTime, frequencyLabel } from "@/lib/utils";

interface Props {
  routine: DashboardRoutine;
  onToggle: (routine: DashboardRoutine) => void;
}

export function RoutineRow({ routine, onToggle }: Props) {
  const done = routine.isCompleted;
  return (
    <button
      type="button"
      onClick={() => onToggle(routine)}
      aria-pressed={done}
      className={cx(
        "group flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 text-left transition-colors",
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
  );
}
