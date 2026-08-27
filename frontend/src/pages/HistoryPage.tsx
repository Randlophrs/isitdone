import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { useHistoryMonth } from "@/features/history/queries";
import { Modal } from "@/components/layout/Modal";
import { cx } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

type Completion = { periodKey: string; routineName: string; completedAt: string };

export function HistoryPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selected, setSelected] = useState<number | null>(null);
  const { data, isLoading, isError } = useHistoryMonth(year, month);

  const completions = (data as { completions?: Completion[] } | undefined)
    ?.completions;

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

  const dayDetail = useMemo(() => {
    if (selected === null) return null;
    const pad = String(selected).padStart(2, "0");
    const items = (completions ?? [])
      .filter((c) => c.periodKey.endsWith(`-${pad}`))
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .map((c) => ({
        name: c.routineName,
        time: new Date(c.completedAt).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
    return { day: selected, items };
  }, [selected, completions]);

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
    setSelected(null);
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
          <div className="card grid grid-cols-7 gap-1 p-3 text-center text-xs font-medium text-muted">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="py-1">{d}</div>
            ))}
          </div>
          <div className="card grid grid-cols-7 gap-1.5 p-3">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const info = byDay.get(day);
              const isSelected = selected === day;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={!info}
                  onClick={() => setSelected(isSelected ? null : day)}
                  aria-pressed={isSelected}
                  className={cx(
                    "group flex aspect-square flex-col items-center justify-center rounded-xl border text-xs transition-all",
                    !info && "border-border/60 text-muted/70 cursor-default",
                    info && !isSelected && "border-accent/30 bg-accent/5 text-accent hover:border-accent/60 hover:bg-accent/10",
                    isSelected && "border-accent bg-accent text-white shadow-md",
                  )}
                >
                  <span>{day}</span>
                  {info && <span className="font-semibold">{info.count}</span>}
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted">
            Tap a filled day to see what you finished.
          </p>
        </>
      )}

      <Modal
        open={dayDetail !== null}
        onClose={() => setSelected(null)}
        label={`Routines on ${MONTHS[month - 1]} ${dayDetail?.day ?? ""}`}
      >
        <div className="card w-full max-w-md overflow-hidden [animation:sheet-up_0.2s_ease-out]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">
                {MONTHS[month - 1]} {dayDetail?.day}
              </h2>
              <p className="text-xs text-muted">
                {dayDetail?.items.length} {dayDetail?.items.length === 1 ? "routine" : "routines"} completed
              </p>
            </div>
            <button
              type="button"
              className="btn-ghost -mr-2 -mt-1 p-1.5"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
            {dayDetail?.items.map((it, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Check size={15} />
                </span>
                <span className="flex-1 text-sm">{it.name}</span>
                <span className="rounded-md bg-bg px-2 py-0.5 font-mono text-xs text-muted">
                  {it.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
}
