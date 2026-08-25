import { useMemo } from "react";
import { useOverallStats } from "@/features/statistics/queries";
import { useRoutines } from "@/features/routines/queries";
import type { RoutineStats } from "@/types";

function StatCard({ s, name }: { s: RoutineStats; name: string }) {
  return (
    <div className="card p-4">
      <h3 className="font-medium truncate">{name}</h3>
      <p className="text-xs capitalize text-muted">{s.frequency}</p>
      <div className="mt-3 flex items-end gap-4">
        <div>
          <div className="text-2xl font-semibold tabular-nums">
            {s.currentStreak}
          </div>
          <div className="text-xs text-muted">current streak</div>
        </div>
        <div>
          <div className="text-2xl font-semibold tabular-nums">
            {s.longestStreak}
          </div>
          <div className="text-xs text-muted">longest</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-semibold tabular-nums text-accent">
            {s.completionRate}%
          </div>
          <div className="text-xs text-muted">done</div>
        </div>
      </div>
    </div>
  );
}

export function StatisticsPage() {
  const { data, isLoading, isError } = useOverallStats();
  const { data: routines } = useRoutines(true);

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of routines ?? []) m.set(r.id, r.name);
    return m;
  }, [routines]);

  return (
    <div className="space-y-4 pb-4">
      <header>
        <h1 className="text-xl font-semibold">Statistics</h1>
        <p className="text-sm text-muted">
          Streaks and completion rate, not pressure.
        </p>
      </header>

      {isError ? (
        <div className="card p-6 text-center text-sm text-muted">
          Could not load statistics.
        </div>
      ) : isLoading ? (
        <div className="card p-6 text-center text-sm text-muted">Loading…</div>
      ) : (
        <>
          <div className="card flex items-center justify-between p-4">
            <span className="text-sm text-muted">Overall completion</span>
            <span className="text-2xl font-semibold tabular-nums text-accent">
              {data?.overallCompletionRate ?? 0}%
            </span>
          </div>
          <div className="space-y-3">
            {(data?.routines ?? []).map((s) => (
              <StatCard
                key={s.routineId}
                s={s}
                name={nameById.get(s.routineId) ?? "Unknown routine"}
              />
            ))}
            {(data?.routines ?? []).length === 0 && (
              <div className="card p-6 text-center text-sm text-muted">
                No routines to summarize yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
