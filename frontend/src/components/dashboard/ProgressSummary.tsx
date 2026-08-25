interface Props {
  completed: number;
  total: number;
  percentage: number;
}

/**
 * Segmented progress: one tick per routine, filled in completion order.
 * More honest than a ring for "X of N".
 */
export function ProgressSummary({ completed, total, percentage }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-muted">Today's progress</h2>
        <span className="text-2xl font-semibold tabular-nums">
          {completed}
          <span className="text-muted">/{total}</span>
        </span>
      </div>
      <div
        className="mt-3 flex h-2 gap-1"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        {total === 0 ? (
          <div className="h-full flex-1 rounded-full bg-border" />
        ) : (
          Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={
                "h-full flex-1 rounded-full transition-colors " +
                (i < completed ? "bg-accent" : "bg-border")
              }
            />
          ))
        )}
      </div>
      <p className="mt-2 text-xs text-muted">{percentage}% complete</p>
    </div>
  );
}
