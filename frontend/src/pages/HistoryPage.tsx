import { useMemo, useState } from "react";
import { useHistoryMonth } from "@/features/history/queries";
import { cx } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function HistoryPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { data, isLoading, isError } = useHistoryMonth(year, month);

  const completions = (data as { completions?: unknown[] } | undefined)
    ?.completions as
    | { periodKey: string; routineName: string; completedAt: string }[]
    | undefined;

  const byDay = useMemo(() => {
    const map = new Map<number, { count: number; names: string[] }>();
    for (const c of completions ?? []) {
      const d = Number(c.periodKey.slice(-2));
      const cur = map.get(d) ?? { count: 0, names: [] };
      cur.count += 1;
      cur.names.push(c.routineName);
      map.set(d, cur);
    }
    return map;
  }, [completions]);

  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array((firstDay + 6) % 7).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shift(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  }

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">History</h1>
        <div className="flex items-center gap-2 text-sm">
          <button className="btn-ghost px-2" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
          <span className="w-32 text-center font-medium">
            {MONTHS[month - 1]} {year}
          </span>
          <button className="btn-ghost px-2" onClick={() => shift(1)} aria-label="Next month">›</button>
        </div>
      </header>

      {isError ? (
        <div className="card p-6 text-center text-sm text-muted">Could not load history.</div>
      ) : isLoading ? (
        <div className="card p-6 text-center text-sm text-muted">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const info = byDay.get(day);
              return (
                <div
                  key={day}
                  title={info?.names.join(", ")}
                  className={cx(
                    "flex aspect-square flex-col items-center justify-center rounded-lg border text-xs",
                    info
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-border text-muted",
                  )}
                >
                  <span>{day}</span>
                  {info && <span className="font-semibold">{info.count}</span>}
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted">
            Tap a day's count shows how many routines you finished. Filled days = at least one done.
          </p>
        </>
      )}
    </div>
  );
}
